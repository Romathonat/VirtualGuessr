import glob
import os
import time
import ctypes
import ctypes.wintypes

import cv2
import keyboard
import numpy as np
import win32api
import win32con
import win32gui
import win32ui
from PIL import Image

# Ajoutez ces définitions après les imports existants
class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long),
                ("top", ctypes.c_long),
                ("right", ctypes.c_long),
                ("bottom", ctypes.c_long)]

def resize_window(hwnd, width, height):
    rect = RECT()
    ctypes.windll.user32.GetWindowRect(hwnd, ctypes.byref(rect))
    x = rect.left
    y = rect.top
    return ctypes.windll.user32.MoveWindow(hwnd, x, y, width, height, True)

def get_window_by_title(title):
    def callback(handle, data):
        if win32gui.IsWindowVisible(handle) and title.lower() in win32gui.GetWindowText(handle).lower():
            data.append(handle)
        return True
    result = []
    win32gui.EnumWindows(callback, result)
    return result[0] if result else None

def capture_window(hwnd):
    # Obtenir les dimensions de la fenêtre
    left, top, right, bottom = win32gui.GetWindowRect(hwnd)
    width = right - left
    height = bottom - top

    # Créer un DC et un bitmap pour la capture
    hwndDC = win32gui.GetWindowDC(hwnd)
    mfcDC = win32ui.CreateDCFromHandle(hwndDC)
    saveDC = mfcDC.CreateCompatibleDC()
    saveBitMap = win32ui.CreateBitmap()
    saveBitMap.CreateCompatibleBitmap(mfcDC, width, height)
    saveDC.SelectObject(saveBitMap)

    # Copier le contenu de la fenêtre dans le bitmap
    result = ctypes.windll.user32.PrintWindow(hwnd, saveDC.GetSafeHdc(), 0)

    # Convertir le bitmap en image
    bmpinfo = saveBitMap.GetInfo()
    bmpstr = saveBitMap.GetBitmapBits(True)
    im = Image.frombuffer(
        'RGB',
        (bmpinfo['bmWidth'], bmpinfo['bmHeight']),
        bmpstr, 'raw', 'BGRX', 0, 1)

    # Nettoyer
    win32gui.DeleteObject(saveBitMap.GetHandle())
    saveDC.DeleteDC()
    mfcDC.DeleteDC()
    win32gui.ReleaseDC(hwnd, hwndDC)

    # Rogner l'image
    left_crop = 19
    right_crop = 19
    top_crop = 180
    bottom_crop = 20
    
    im_cropped = im.crop((left_crop, 
                          top_crop, 
                          im.width - right_crop, 
                          im.height - bottom_crop))

    return np.array(im_cropped)

def move_cursor_to_window_center(hwnd):
    rect = win32gui.GetWindowRect(hwnd)
    x = rect[0] + (rect[2] - rect[0]) // 2
    y = rect[1] + (rect[3] - rect[1]) // 2
    win32api.SetCursorPos((x, y))

def move_mouse(dx, dy):
    print(f"Déplacement de la souris avec clic molette maintenu : dx={dx}, dy={dy}")
    # Simuler l'appui sur le bouton du milieu (molette) de la souris
    win32api.mouse_event(win32con.MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, 0)
    time.sleep(0.2)  # Petit délai pour s'assurer que le clic est enregistré

    # Déplacer la souris
    win32api.mouse_event(win32con.MOUSEEVENTF_MOVE, dx, dy, 0, 0)
    time.sleep(0.1)  # Délai pour le mouvement

    # Relâcher le bouton du milieu (molette) de la souris
    win32api.mouse_event(win32con.MOUSEEVENTF_MIDDLEUP, 0, 0, 0, 0)

def press_and_hold_key(key, duration):
    keyboard.press(key)
    time.sleep(duration)
    keyboard.release(key)

def press_key(key):
    if key == ",":
        win32api.keybd_event(0xBC, 0, 0, 0)
        time.sleep(0.1)
        win32api.keybd_event(0xBC, 0, win32con.KEYEVENTF_KEYUP, 0)
    else:
        keyboard.press_and_release(key)

def move_and_capture(hwnd, captured_images, face, dx, dy):
    move_mouse(dx, dy)
    time.sleep(0.5)

    move_cursor_to_window_center(hwnd)
    time.sleep(0.2)

    image = capture_window(hwnd)
    filename = f"cubemap_captures/{face}.jpg"
    cv2.imwrite(filename, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
    captured_images.append(filename)

    time.sleep(0.5)
    print(f"Image {face} capturée")

def capture_cubemap(hwnd, output_folder):
    captured_images = []

    def capture_face(face, dx, dy):
        move_mouse(dx, dy)
        time.sleep(0.5)
        move_cursor_to_window_center(hwnd)
        time.sleep(0.2)
        image = capture_window(hwnd)
        filename = f"{output_folder}/{face}.jpg"
        cv2.imwrite(filename, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        captured_images.append(filename)
        print(f"Image {face} capturée")

    capture_face('left', -MOUSE_MOVE_LEFT, 0)
    capture_face('front', MOUSE_MOVE_RIGHT, 0)

    capture_face('top', 0, -MOUSE_MOVE_UP)
    capture_face('bottom', 0, MOUSE_MOVE_VERTICAL_LARGE)

    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)
    move_mouse(0, -MOUSE_MOVE_UP)
    time.sleep(0.5)

    capture_face('right', MOUSE_MOVE_RIGHT, 0)
    capture_face('back', MOUSE_MOVE_RIGHT, 0)

    return captured_images

def generate_cubemap(captured_images, capture_number, target_width, target_height):
    cubemap = np.zeros((3 * target_height, 4 * target_width, 3), dtype=np.uint8)
    
    positions = {
        'left': (target_height, 0),
        'front': (target_height, target_width),
        'top': (0, target_width),
        'bottom': (2 * target_height, target_width),
        'right': (target_height, 2 * target_width),
        'back': (target_height, 3 * target_width),
    }
    
    for img_path, (y, x) in zip(captured_images, positions.values()):
        img = cv2.imread(img_path)
        cubemap[y:y+target_height, x:x+target_width] = img

    cubemap_filename = f"cubemap_captures/cubemap_{capture_number}.jpg"
    cv2.imwrite(cubemap_filename, cubemap)
    print(f"Cubemap générée et sauvegardée comme '{cubemap_filename}'.")
    
    return cubemap

def get_next_folder_number():
    existing_folders = glob.glob("cubemap_captures/*/")
    if not existing_folders:
        return 1
    max_number = max([int(os.path.basename(os.path.dirname(f))) for f in existing_folders])
    return max_number + 1

def create_new_capture_folder():
    folder_number = get_next_folder_number()
    new_folder = f"cubemap_captures/{folder_number}"
    os.makedirs(new_folder, exist_ok=True)
    return new_folder

def capture_sequence(hwnd, capture_number, target_width, target_height, output_folder):
    print(f"\nDébut de la séquence de capture {capture_number}")

    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)

    print("Pause du replay")
    press_key("p")
    time.sleep(0.5) 

    print("Ouverture de la map")
    press_key(",")
    time.sleep(1)

    print("Centrage de la carte")
    press_key("space")
    time.sleep(0.5)

    print("Capture de l'écran pour la localisation")
    loc_image = capture_window(hwnd)
    loc_filename = f"{output_folder}/{capture_number}_loc.jpg"
    cv2.imwrite(loc_filename, cv2.cvtColor(loc_image, cv2.COLOR_RGB2BGR))
    print(f"  Image de localisation sauvegardée : {loc_filename}")

    print("Fermeture de la map")
    press_key(",")
    time.sleep(0.5)


    print("Remontée de la caméra")
    press_and_hold_key("e", 0.4)
    time.sleep(0.5)

    move_cursor_to_window_center(hwnd)

    print("Ajustement initial de la caméra pour la capture cubemap")
    move_mouse(0, MOUSE_MOVE_DOWN)  # Faire descendre la caméra
    time.sleep(0.1)
    
    time.sleep(0.2)
    move_mouse(0, -MOUSE_MOVE_UP)  # Remonter pour se mettre à l'horizontale
    time.sleep(0.2)

    print("Début de la capture cubemap")
    captured_images = capture_cubemap(hwnd, output_folder)
    print(f"  {len(captured_images)} images capturées pour la cubemap")

    print("Remise de la caméra du joueur")
    press_key("b")
    time.sleep(0.5)

    print("Génération de la cubemap")
    generate_cubemap(captured_images, capture_number, target_width, target_height)

    print("Reprise du replay")
    press_key("p")

    print(f"Séquence de capture {capture_number} terminée.")

def main():
    game_window_title = "PUBG: BATTLEGROUNDS"
    capture_interval = 60  # Intervalle en secondes entre chaque capture
    target_width = 1200 
    target_height = 1200 

    hwnd = get_window_by_title(game_window_title)
    if not hwnd:
        print(f"Fenêtre '{game_window_title}' non trouvée.")
        return

    print(f"Redimensionnement de la fenêtre à {target_width}x{target_height}")
    if resize_window(hwnd, target_width + 38, target_height + 200):
        print("Fenêtre redimensionnée avec succès")
        # Vérification de la taille réelle
        rect = win32gui.GetWindowRect(hwnd)
        actual_width = rect[2] - rect[0]
        actual_height = rect[3] - rect[1]
        print(f"Taille réelle de la fenêtre : {actual_width}x{actual_height}")
    else:
        print("Échec du redimensionnement de la fenêtre")

    win32gui.SetForegroundWindow(hwnd)
    time.sleep(1)

    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)

    os.makedirs("cubemap_captures", exist_ok=True)
    output_folder = create_new_capture_folder()
    print(f"Les captures seront enregistrées dans : {output_folder}")

    capture_number = 1

    try:
        while True:
            capture_sequence(hwnd, capture_number, target_width, target_height, output_folder)
            capture_number += 1
            print(f"Attente de {capture_interval} secondes avant la prochaine capture...")
            break
            time.sleep(capture_interval)
    except KeyboardInterrupt:
        print("Capture interrompue par l'utilisateur.")

# Ajoutez ces variables globales au début du fichier, après les imports
MOUSE_MOVE_LEFT = 3480
MOUSE_MOVE_RIGHT = 3550
MOUSE_MOVE_UP = 3475
MOUSE_MOVE_DOWN = 4000
MOUSE_MOVE_VERTICAL_LARGE = 2 * MOUSE_MOVE_DOWN  # Ajustez si nécessaire

if __name__ == "__main__":
    main()
