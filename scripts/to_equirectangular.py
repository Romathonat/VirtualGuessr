import cv2
import numpy as np


def cylindrical_to_equirectangular(cylindrical_img, output_height=4096):
    height, width = cylindrical_img.shape[:2]

    # Calculer la largeur de l'image équirectangulaire
    output_width = output_height * 2

    # Créer une image équirectangulaire vide
    equirectangular = np.zeros((output_height, output_width, 3), dtype=np.float32)

    # Créer des grilles de coordonnées
    x_grid, y_grid = np.meshgrid(np.arange(output_width), np.arange(output_height))

    # Convertir les coordonnées équirectangulaires en coordonnées cylindriques
    theta = (x_grid / output_width - 0.5) * 2 * np.pi
    phi = (y_grid / output_height - 0.5) * np.pi

    # Calculer les coordonnées dans l'image cylindrique
    cy = (phi / np.pi + 0.5) * height
    cx = (theta / (2 * np.pi) + 0.5) * width

    # Utiliser une interpolation bicubique pour un meilleur résultat
    equirectangular = cv2.remap(
        cylindrical_img,
        cx.astype(np.float32),
        cy.astype(np.float32),
        cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_WRAP,
    )

    return equirectangular


# Charger l'image cylindrique
cylindrical_img = cv2.imread("./equirectangular_cylindrical.jpg")

# Convertir en équirectangulaire
equirectangular_img = cylindrical_to_equirectangular(cylindrical_img)

# Sauvegarder l'image équirectangulaire
cv2.imwrite("equirectangular.jpg", equirectangular_img)
