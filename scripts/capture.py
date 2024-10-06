import os
import time

import cv2
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


def move_mouse(dx, dy):
    win32api.mouse_event(win32con.MOUSEEVENTF_MOVE, dx, dy, 0, 0)


def capture_horizontal_360(window_title, num_captures=5, delay=0.1):
    hwnd = get_window_by_title(window_title)
    if not hwnd:
        print(f"Fenêtre '{window_title}' non trouvée.")
        return []

    win32gui.SetForegroundWindow(hwnd)
    time.sleep(1)  # Attendre que la fenêtre soit au premier plan

    # Créer un dossier pour sauvegarder les images
    os.makedirs("360_captures", exist_ok=True)

    # Ajustement initial de la caméra
    print("Ajustement initial de la position de la caméra...")
    move_mouse(0, 3000)  # Faire descendre la caméra
    time.sleep(delay)
    print("Remontée")
    move_mouse(0, -1740)  # Remonter pour se mettre à l'horizontale
    time.sleep(delay)

    captured_images = []

    # Capture des images horizontales
    mouse_move = 1800
    for i in range(num_captures):
        image = capture_window(hwnd)
        filename = f"360_captures/horizontal_{i}.jpg"
        cv2.imwrite(filename, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        captured_images.append(filename)
        print(f"Image horizontale {i+1}/{num_captures} capturée")
        move_mouse(mouse_move, 0)
        time.sleep(delay)

    print("Toutes les images horizontales ont été capturées.")
    return captured_images


def generate_cylindrical_equirectangular(captured_images):
    # Lire toutes les images
    images = [cv2.imread(img) for img in captured_images]
    height, width = images[0].shape[:2]

    num_images = len(images)
    output_width = width * num_images
    output_height = height

    equirectangular = np.zeros((output_height, output_width, 3), dtype=np.uint8)

    for i, img in enumerate(images):
        equirectangular[:, i * width : (i + 1) * width] = img

    # Tronquer les 1000 derniers pixels de la largeur
    equirectangular = equirectangular[:, :-3438]

    # Sauvegarder l'image équirectangulaire
    cv2.imwrite("equirectangular_cylindrical.jpg", equirectangular)
    print(
        "Image équirectangulaire cylindrique générée et sauvegardée comme 'equirectangular_cylindrical.jpg'."
    )
    print(
        f"Dimensions de l'image : {equirectangular.shape[1]}x{equirectangular.shape[0]}"
    )

    return equirectangular


if __name__ == "__main__":
    game_window_title = "PUBG: BATTLEGROUNDS"
    num_captures = 5  # Nombre de captures pour un tour complet

    captured_images = capture_horizontal_360(game_window_title, num_captures)
    print(f"Nombre total d'images capturées : {len(captured_images)}")

    generate_cylindrical_equirectangular(captured_images)
