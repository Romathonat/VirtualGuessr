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

    # # Rogner l'image
    # left_crop = 19
    # right_crop = 19
    # top_crop = 110
    # bottom_crop = 10
    
    # im_cropped = im.crop((left_crop, 
    #                       top_crop, 
    #                       im.width - right_crop, 
    #                       im.height - bottom_crop))

    return np.array(im)

def move_cursor_to_window_center(hwnd):
    rect = win32gui.GetWindowRect(hwnd)
    x = rect[0] + (rect[2] - rect[0]) // 2
    y = rect[1] + (rect[3] - rect[1]) // 2
    win32api.SetCursorPos((x, y))
    print(f"Curseur recentré à : ({x}, {y})")

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
    print("Clic molette relâché")

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

def adjust_fov_to_90(image, target_height):
    height, width = image.shape[:2]
    
    # Calculer le pourcentage à recadrer pour obtenir un FOV de 90 degrés
    # Cette valeur peut nécessiter un ajustement fin basé sur le FOV réel du jeu
    crop_percentage = 0.0255 # Correspond à un FOV vertical d'environ 106.26 degrés
    
    crop_pixels = int(height * crop_percentage)
    
    # Recadrer l'image
    cropped_img = image[crop_pixels:-crop_pixels, :]
    
    # Redimensionner l'image à la hauteur cible
    adjusted_img = cv2.resize(cropped_img, (width, target_height), interpolation=cv2.INTER_LINEAR)
    
    return adjusted_img

def capture_cubemap(hwnd, output_folder):
    captured_images = []

    time.sleep(0.5)

    move_and_capture(hwnd, captured_images, 'left', -MOUSE_MOVE_HORIZONTAL, 0)
    move_and_capture(hwnd, captured_images, 'front', MOUSE_MOVE_HORIZONTAL, 0)

    move_and_capture(hwnd, captured_images, 'top', 0, -MOUSE_MOVE_VERTICAL)
    move_and_capture(hwnd, captured_images, 'bottom', 0, MOUSE_MOVE_VERTICAL_LARGE)

    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)
    move_mouse(0, -MOUSE_MOVE_VERTICAL)
    time.sleep(0.5)

    move_and_capture(hwnd, captured_images, 'right', MOUSE_MOVE_HORIZONTAL, 0)
    move_and_capture(hwnd, captured_images,  'back', MOUSE_MOVE_HORIZONTAL, 0)

    return captured_images

def generate_cubemap(captured_images, capture_number, target_width, target_height, output_folder):
    cubemap = np.zeros((3 * target_height, 4 * target_width, 3), dtype=np.uint8)
    
    positions = {
        'left': (target_height, 0),
        'front': (target_height, target_width),
        'top': (0, target_width),
        'bottom': (2 * target_height, target_width),
        'right': (target_height, 2 * target_width),
        'back': (target_height, 3 * target_width),
    }
    
    for img_path, (face, (y, x)) in zip(captured_images, positions.items()):
        img = cv2.imread(img_path)
        adjusted_img = adjust_fov_to_90(img, target_height)
        
        # Sauvegarde de l'image ajustée
        adjusted_filename = f"{output_folder}/{face}.jpg"
        cv2.imwrite(adjusted_filename, adjusted_img)
        print(f"Image ajustée sauvegardée : {adjusted_filename}")
        
        cubemap[y:y+target_height, x:x+target_width] = adjusted_img

    cubemap_filename = f"{output_folder}/cubemap_{capture_number}.jpg"
    cv2.imwrite(cubemap_filename, cubemap)
    print(f"Cubemap générée et sauvegardée comme '{cubemap_filename}'.")
    
    return cubemap

def get_next_capture_number():
    existing_files = glob.glob("cubemap_captures/cubemap_*.jpg")
    if not existing_files:
        return 1
    max_number = max([int(os.path.basename(f).split("_")[1].split(".")[0]) for f in existing_files])
    return max_number + 1

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

    # print("Pause du replay")
    # press_key("p")
    # time.sleep(0.5) 

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
    press_and_hold_key("e", 0.2)
    time.sleep(0.5)


    move_cursor_to_window_center(hwnd)

    print("Ajustement initial de la caméra pour la capture cubemap")
    move_mouse(0, 3500)  # Faire descendre la caméra (2fois sinon bug)
    time.sleep(0.2)
    move_cursor_to_window_center(hwnd)

    move_mouse(0, 3500)  # Faire descendre la caméra (2fois sinon bug)
    time.sleep(0.2)
    move_cursor_to_window_center(hwnd)


    time.sleep(0.2)
    move_mouse(0, -MOUSE_MOVE_VERTICAL)  # Remonter pour se mettre à l'horizontale
    time.sleep(0.2)
    move_cursor_to_window_center(hwnd)

    print("Début de la capture cubemap")
    captured_images = capture_cubemap(hwnd, output_folder)
    print(f"  {len(captured_images)} images capturées pour la cubemap")

    print("Remise de la caméra du joueur")
    press_key("b")
    time.sleep(0.5)

    print("Génération de la cubemap")
    generate_cubemap(captured_images, capture_number, target_width, target_height, output_folder)

    # print("Reprise du replay")
    # press_key("p")

    print(f"Séquence de capture {capture_number} terminée.")

def remove_window_border(hwnd):
    style = win32gui.GetWindowLong(hwnd, win32con.GWL_STYLE)
    style &= ~(win32con.WS_CAPTION | win32con.WS_THICKFRAME | win32con.WS_MINIMIZEBOX | win32con.WS_MAXIMIZEBOX | win32con.WS_SYSMENU)
    win32gui.SetWindowLong(hwnd, win32con.GWL_STYLE, style)
    
    # Supprime également les styles étendus
    ex_style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
    ex_style &= ~(win32con.WS_EX_DLGMODALFRAME | win32con.WS_EX_CLIENTEDGE | win32con.WS_EX_STATICEDGE)
    win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, ex_style)
    
    # Force la mise à jour de l'apparence de la fenêtre
    win32gui.SetWindowPos(hwnd, None, 0, 0, 0, 0, 
                          win32con.SWP_FRAMECHANGED | win32con.SWP_NOMOVE | 
                          win32con.SWP_NOSIZE | win32con.SWP_NOZORDER | 
                          win32con.SWP_NOOWNERZORDER)

def get_screen_size():
    return (ctypes.windll.user32.GetSystemMetrics(0), ctypes.windll.user32.GetSystemMetrics(1))

def resize_and_position_window(hwnd, width, height):
    screen_width, screen_height = get_screen_size()
    
    # Calculer la position x pour placer la fenêtre à droite, mais 200 pixels vers la gauche
    x = screen_width - width - 200
    y = 100  # Commencer 100 pixels plus bas que le haut de l'écran
    
    # Ajuster la hauteur si elle dépasse l'écran
    if height > screen_height - y:
        height = screen_height - y
    
    # Ajuster la position x si elle est négative
    if x < 0:
        x = 0
    
    # Déplacer et redimensionner la fenêtre
    result = ctypes.windll.user32.MoveWindow(hwnd, x, y, width, height, True)
    
    if result:
        print(f"Fenêtre redimensionnée et positionnée avec succès : {width}x{height} à ({x}, {y})")
    else:
        print("Échec du redimensionnement et du positionnement de la fenêtre")
    
    return result

def press_ctrl_u():
    print("Appui sur Ctrl + U")
    keyboard.press('ctrl')
    keyboard.press('u')
    time.sleep(0.1)
    keyboard.release('u')
    keyboard.release('ctrl')
    time.sleep(0.5)

def main():
    game_window_title = "PUBG: BATTLEGROUNDS"
    capture_interval = 60  # Intervalle en secondes entre chaque capture
    target_width = 1200 
    target_height = 1200 

    hwnd = get_window_by_title(game_window_title)
    if not hwnd:
        print(f"Fenêtre '{game_window_title}' non trouvée.")
        return

    print("Suppression de la bordure de la fenêtre")
    remove_window_border(hwnd)

    print(f"Redimensionnement et positionnement de la fenêtre à {target_width}x{target_height}")
    if resize_and_position_window(hwnd, target_width, target_height):
        # Vérification de la taille et position réelles
        rect = win32gui.GetWindowRect(hwnd)
        actual_width = rect[2] - rect[0]
        actual_height = rect[3] - rect[1]
        actual_x = rect[0]
        actual_y = rect[1]
        print(f"Taille réelle de la fenêtre : {actual_width}x{actual_height}")
        print(f"Position réelle de la fenêtre : ({actual_x}, {actual_y})")
    else:
        print("Échec du redimensionnement et du positionnement de la fenêtre")

    win32gui.SetForegroundWindow(hwnd)
    time.sleep(1)

    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)

    os.makedirs("cubemap_captures", exist_ok=True)
    output_folder = create_new_capture_folder()
    print(f"Les captures seront enregistrées dans : {output_folder}")

    capture_number = 1

    try:
        print("Début de la séance de capture")
        press_ctrl_u()  # Ajout de Ctrl + U au début

        while True:
            capture_sequence(hwnd, capture_number, target_width, target_height, output_folder)
            capture_number += 1
            print(f"Attente de {capture_interval} secondes avant la prochaine capture...")
            break
            time.sleep(capture_interval)
    except KeyboardInterrupt:
        print("Capture interrompue par l'utilisateur.")
    finally:
        print("Fin de la séance de capture")
        press_ctrl_u()  # Ajout de Ctrl + U à la fin

# Ajoutez ces variables globales au début du fichier, après les imports
MOUSE_MOVE_HORIZONTAL = 3592
MOUSE_MOVE_VERTICAL = 3474 
MOUSE_MOVE_VERTICAL_LARGE = 8000  # Ajustez si nécessaire

if __name__ == "__main__":
    main()
