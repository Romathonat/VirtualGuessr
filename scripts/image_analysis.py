import cv2
import numpy as np
import pytesseract
from PIL import Image
import sys

def find_strongest_line(img, start, direction, search_range=318, line_width=5, threshold=10):
    height, width = img.shape[:2]
    strongest_line = None
    max_contrast = 0
    max_strength = 0
    if direction == 'down':
        start_y = min(height-1, start[1])
        end_y = min(height-1, start[1] + search_range)
        for y in range(start_y, end_y, 1):
            line = np.mean(img[y, :])
            above = np.mean(img[y-line_width:y-1, :])
            below = np.mean(img[y+1:y+line_width, :])
            contrast = np.mean([above, below]) - line

            if contrast > max_contrast:
                max_contrast = contrast
                strongest_line = y
    elif direction == 'up':
        start_y = max(0, start[1])
        end_y = max(0, start[1] - search_range)
        for y in range(start_y, end_y, -1):
            line = np.mean(img[y, :])
            above = np.mean(img[y-line_width:y-1, :])
            below = np.mean(img[y+1:y+line_width, :])
            contrast = np.mean([above, below]) - line

            if contrast > max_contrast:
                max_contrast = contrast
                strongest_line = y

    elif direction == 'left':
        start_x = max(0, start[0])
        end_x = max(0, start[0] - search_range)
        for x in range(start_x, end_x, -1):
            line = np.mean(img[:, x])
            above = np.mean(img[:, x-line_width:x-1])
            below = np.mean(img[:, x+1:x+line_width])
            contrast = np.mean([above, below]) - line

            if contrast > max_contrast:
                max_contrast = contrast
                strongest_line = x 
    elif direction == 'right':
        start_x = min(width-1, start[0])
        end_x = min(width-1, start[0] + search_range)
        for x in range(start_x, end_x, 1):
            line = np.mean(img[:, x])
            above = np.mean(img[:, x-line_width:x-1])
            below = np.mean(img[:, x+1:x+line_width])
            contrast = np.mean([above, below]) - line

            if contrast > max_contrast:
                max_contrast = contrast
                strongest_line = x 
       
    return strongest_line

def preprocess_for_ocr(img):
    # Convertir en niveaux de gris si ce n'est pas déjà fait
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Agrandir l'image
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # Appliquer un seuillage adaptatif
    # img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Inverser l'image (texte blanc sur fond noir)
    img = cv2.bitwise_not(img)
    
    return img

def recognize_letter(img, debug_name):
    # Prétraiter l'image
    processed = preprocess_for_ocr(img)
    
    # Utiliser pytesseract avec des paramètres ajustés
    config = r'--oem 3 --psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    letter = pytesseract.image_to_string(processed, config=config).strip()
    
    # Si pytesseract ne trouve rien, essayons avec l'image d'origine
    if not letter:
        letter = pytesseract.image_to_string(img, config=config).strip()
    
    
    return letter

def detect_grid_position(image_path):
    """
    Détecte la position dans la grille et les coordonnées relatives dans le carré.
    
    Args:
        image_path (str): Chemin vers l'image à analyser
        
    Returns:
        tuple: (grid_square, pixel_x, pixel_y, percent_x, percent_y)
            - grid_square (str): Position dans la grille (ex: "E L")
            - pixel_x (int): Position en pixels X
            - pixel_y (int): Position en pixels Y
            - percent_x (float): Position en pourcentage X (0-100)
            - percent_y (float): Position en pourcentage Y (0-100)
    """
    # Charger l'image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Impossible de charger l'image")
    
    # Obtenir les dimensions de l'image
    height, width = img.shape[:2]
    
    # Convertir l'image en niveaux de gris
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Trouver le point central
    center_x, center_y = width // 2, height // 2
    
    # Trouver les lignes les plus fortes dans chaque direction
    top = find_strongest_line(gray, (center_x, center_y), 'up')
    bottom = find_strongest_line(gray, (center_x, center_y), 'down')
    left = find_strongest_line(gray, (center_x, center_y), 'left')
    right = find_strongest_line(gray, (center_x, center_y), 'right')
    
    # Créer une copie de l'image pour dessiner les lignes détectées
    line_image = img.copy()
    
    # Dessiner les lignes détectées
    if top is not None:
        cv2.line(line_image, (0, top), (width, top), (0, 255, 0), 2)
    if bottom is not None:
        cv2.line(line_image, (0, bottom), (width, bottom), (0, 255, 0), 2)
    if left is not None:
        cv2.line(line_image, (left, 0), (left, height), (0, 0, 255), 2)
    if right is not None:
        cv2.line(line_image, (right, 0), (right, height), (0, 0, 255), 2)
    
    # Sauvegarder l'image avec les lignes détectées
    # cv2.imwrite('detected_lines.jpg', line_image)
    
    if top is None or bottom is None or left is None or right is None:
        raise ValueError("Impossible de détecter toutes les lignes nécessaires")
    
    pixel_x = center_x - left
    pixel_y = center_y - top

    pixel_x_scaled = pixel_x * 150 / 316 # because we need to reduce it
    pixel_y_scaled = pixel_y * 150 / 316

    # Extraire et reconnaître les lettres
    roi_height = 40  # Augmenté pour capturer plus de contexte
    roi_width = 40   # Largeur de la ROI pour la reconnaissance des lettres

    # ROI pour la lettre du haut (près de la ligne gauche)
    top_roi = img[0:roi_height, left:left+roi_width]

    # ROI pour la lettre de gauche (près de la ligne supérieure)
    left_roi = img[top:top+roi_height, 0:roi_height] 
    
    # Vérifier si les ROI sont vides
    if top_roi.size == 0 or left_roi.size == 0:
        print("Avertissement : Une ou plusieurs ROI sont vides.")
        grid_square = "??"
    else:
        # Augmenter la taille des ROI pour une meilleure reconnaissance
        top_roi = cv2.resize(top_roi, (0,0), fx=2, fy=2)
        left_roi = cv2.resize(left_roi, (0,0), fx=2, fy=2)
        
        top_letter = recognize_letter(top_roi, 'top')
        left_letter = recognize_letter(left_roi, 'left')
        
        grid_square = f"{top_letter} {left_letter}"
    
    # Après avoir obtenu grid_square, pixel_x, et pixel_y

    # Calculer la position absolue
    absolute_x, absolute_y = calculate_absolute_position(grid_square, pixel_x_scaled, pixel_y_scaled)

    return grid_square, pixel_x_scaled, pixel_y_scaled, absolute_x, absolute_y

def calculate_absolute_position(grid_square, pixel_x, pixel_y):
    # Extraire les lettres du grid_square
    vertical_letter, horizontal_letter = grid_square.split()

    # Calculer la position du coin supérieur gauche du carré courant
    top_left_y = (ord(horizontal_letter) - ord('I')) * 150
    top_left_x = (ord(vertical_letter) - ord('A')) * 150


    absolute_x = top_left_x + pixel_x
    absolute_y = top_left_y + pixel_y

    return absolute_x, absolute_y

def main(image_path):
    try:
        # Détecter la position
        grid_square, pixel_x, pixel_y, absolute_x, absolute_y = detect_grid_position(image_path)
        
        print(f"Position dans la grille: {grid_square}")
        print(f"Position relative X: {pixel_x} pixels")
        print(f"Position relative Y: {pixel_y} pixels")
        print(f"Position absolue X: {absolute_x} pixels")
        print(f"Position absolue Y: {absolute_y} pixels")
        print("Une image 'detected_lines.jpg' a été générée avec les lignes détectées.")
        
    except Exception as e:
        print(f"Erreur: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python image_analysis.py <chemin_de_l'image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    main(image_path)
