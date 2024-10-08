import glob
import os
import time

import cv2
import keyboard
import numpy as np
import win32api
import win32con
import win32gui
import win32ui
from PIL import Image


def get_window_by_title(title):
    def callback(handle, data):
        if (
            win32gui.IsWindowVisible(handle)
            and title.lower() in win32gui.GetWindowText(handle).lower()
        ):
            data.append(handle)
        return True

    result = []
    win32gui.EnumWindows(callback, result)
    return result[0] if result else None


def capture_window(hwnd):
    left, top, right, bot = win32gui.GetClientRect(hwnd)
    w = right - left
    h = bot - top
    hwndDC = win32gui.GetWindowDC(hwnd)
    mfcDC = win32ui.CreateDCFromHandle(hwndDC)
    saveDC = mfcDC.CreateCompatibleDC()
    saveBitMap = win32ui.CreateBitmap()
    saveBitMap.CreateCompatibleBitmap(mfcDC, w, h)
    saveDC.SelectObject(saveBitMap)
    saveDC.BitBlt((0, 0), (w, h), mfcDC, (0, 0), win32con.SRCCOPY)
    bmpinfo = saveBitMap.GetInfo()
    bmpstr = saveBitMap.GetBitmapBits(True)
    im = Image.frombuffer(
        "RGB", (bmpinfo["bmWidth"], bmpinfo["bmHeight"]), bmpstr, "raw", "BGRX", 0, 1
    )
    win32gui.DeleteObject(saveBitMap.GetHandle())
    saveDC.DeleteDC()
    mfcDC.DeleteDC()
    win32gui.ReleaseDC(hwnd, hwndDC)
    return np.array(im)


def move_cursor_to_window_center(hwnd):
    # Obtenir les coordonnées de la fenêtre
    left, top, right, bottom = win32gui.GetWindowRect(hwnd)

    # Calculer le centre de la fenêtre
    center_x = (left + right) // 2
    center_y = (top + bottom) // 2

    # Déplacer le curseur au centre de la fenêtre
    win32api.SetCursorPos((center_x, center_y))
    print(f"Curseur déplacé au centre de la fenêtre : ({center_x}, {center_y})")


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
        win32api.keybd_event(0xBC, 0, 0, 0)  # Appuyer sur la touche virgule
        time.sleep(0.1)
        win32api.keybd_event(0xBC, 0, win32con.KEYEVENTF_KEYUP, 0)  # Relâcher la touche
    else:
        keyboard.press_and_release(key)


def scroll_mouse(direction):
    win32api.mouse_event(win32con.MOUSEEVENTF_WHEEL, 0, 0, direction * 120, 0)


def generate_cylindrical_equirectangular(captured_images, capture_number):
    images = [cv2.imread(img) for img in captured_images]
    height, width = images[0].shape[:2]

    num_images = len(images)
    output_width = width * num_images
    output_height = height
    equirectangular = np.zeros((output_height, output_width, 3), dtype=np.uint8)
    for i, img in enumerate(images):
        equirectangular[:, i * width : (i + 1) * width] = img
    equirectangular = equirectangular[:, :-3438]

    equirectangular_filename = f"360_captures/equirectangular_{capture_number}.jpg"
    cv2.imwrite(equirectangular_filename, equirectangular)
    print(
        f"Image équirectangulaire cylindrique générée et sauvegardée comme '{equirectangular_filename}'."
    )
    print(
        f"Dimensions de l'image : {equirectangular.shape[1]}x{equirectangular.shape[0]}"
    )

    # Suppression des images individuelles
    for img_path in captured_images:
        os.remove(img_path)
        print(f"Image supprimée : {img_path}")

    return equirectangular


def capture_horizontal_360(hwnd, num_captures=5, delay=0.5):
    captured_images = []
    mouse_move = 1800
    for i in range(num_captures):
        image = capture_window(hwnd)
        filename = f"360_captures/horizontal_{i}.jpg"
        cv2.imwrite(filename, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        captured_images.append(filename)
        print(f"Image horizontale {i+1}/{num_captures} capturée")
        move_mouse(mouse_move, 0)
        time.sleep(delay)
    return captured_images


def get_next_capture_number():
    existing_files = glob.glob("360_captures/*_loc.jpg")
    if not existing_files:
        return 1
    max_number = max([int(os.path.basename(f).split("_")[0]) for f in existing_files])
    return max_number + 1


def capture_sequence(hwnd, capture_number):
    print(f"\nDébut de la séquence de capture {capture_number}")

    # Déplacer le curseur au centre de la fenêtre du jeu
    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)  # Attendre un peu après le déplacement du curseur

    print("Pause du replay")
    press_key("p")
    time.sleep(0.5)

    print("Ouverture de la map")
    press_key(",")
    time.sleep(1)

    # print("Zoom sur la map")
    # for i in range(2):
    #     print(f"  Zoom {i+1}/3")
    #     scroll_mouse(1)
    #     time.sleep(0.1)

    print("Centrage de la carte")
    press_key("space")
    time.sleep(0.5)

    print("Capture de l'écran pour la localisation")
    loc_image = capture_window(hwnd)
    loc_filename = f"360_captures/{capture_number}_loc.jpg"
    cv2.imwrite(loc_filename, cv2.cvtColor(loc_image, cv2.COLOR_RGB2BGR))
    print(f"  Image de localisation sauvegardée : {loc_filename}")

    print("Fermeture de la map")
    press_key(",")
    time.sleep(0.5)

    print("Remontée de la caméra")
    press_and_hold_key("e", 0.4)
    time.sleep(0.5)

    print("Ajustement initial de la caméra pour la capture panoramique")
    move_mouse(0, 3000)  # Faire descendre la caméra
    time.sleep(0.5)

    print("Remontée")
    move_mouse(0, -1740)  # Remonter pour se mettre à l'horizontale
    time.sleep(0.5)

    print("Début de la capture panoramique à 360°")
    captured_images = capture_horizontal_360(hwnd)
    print(f"  {len(captured_images)} images capturées pour le panorama")

    print("Remise de la caméra du joueur")
    press_key("b")
    time.sleep(0.5)

    print("Génération de l'image équirectangulaire")
    generate_cylindrical_equirectangular(captured_images, capture_number)

    print("Reprise du replay")
    press_key("p")

    print(f"Séquence de capture {capture_number} terminée.")


def main():
    game_window_title = "PUBG: BATTLEGROUNDS"
    capture_interval = 60  # Intervalle en secondes entre chaque capture

    hwnd = get_window_by_title(game_window_title)
    if not hwnd:
        print(f"Fenêtre '{game_window_title}' non trouvée.")
        return

    win32gui.SetForegroundWindow(hwnd)
    time.sleep(1)  # Attendre que la fenêtre soit au premier plan

    # Déplacer le curseur au centre de la fenêtre du jeu au début
    move_cursor_to_window_center(hwnd)
    time.sleep(0.5)

    os.makedirs("360_captures", exist_ok=True)

    capture_number = get_next_capture_number()

    try:
        while True:
            capture_sequence(hwnd, capture_number)
            capture_number += 1
            print(
                f"Attente de {capture_interval} secondes avant la prochaine capture..."
            )
            time.sleep(capture_interval)
    except KeyboardInterrupt:
        print("Capture interrompue par l'utilisateur.")


if __name__ == "__main__":
    main()
