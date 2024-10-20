import csv
import os
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk


class LocationPicker:
    def __init__(self, master):
        self.master = master
        self.master.title("Sélecteur de localisation")

        # Redimensionnement de la fenêtre principale
        self.master.geometry("1920x1080")

        # Création des cadres pour les deux visualisations
        self.frame_map = ttk.Frame(master)
        self.frame_map.pack(side=tk.LEFT, padx=10, pady=10)
        self.frame_capture = ttk.Frame(master)
        self.frame_capture.pack(side=tk.RIGHT, padx=10, pady=10)

        # Canvas pour la carte Erangel
        self.canvas_map = tk.Canvas(self.frame_map, width=1024, height=1024)
        self.canvas_map.pack(expand=True, fill=tk.BOTH)

        # Canvas pour la capture du jeu
        self.canvas_capture = tk.Canvas(self.frame_capture, width=800, height=600)
        self.canvas_capture.pack(expand=True, fill=tk.BOTH)

        # Chargement de la carte Erangel
        self.load_erangel_map()

        self.images = []
        self.current_image = 0
        self.csv_file = "positions.csv"
        self.base_folder = "../virtualguessr_front/public/images/cubemap"
        self.map_size = 8192  # Taille réelle de la carte
        self.display_size = 1024

        self.canvas_map.bind("<Button-1>", self.on_click)
        self.load_images()

    def load_erangel_map(self):
        map_path = "../virtualguessr_front/public/images/erangel.jpg"
        self.erangel_map = Image.open(map_path)
        self.erangel_map = self.erangel_map.resize((1024, 1024), Image.LANCZOS)
        self.erangel_photo = ImageTk.PhotoImage(self.erangel_map)
        self.canvas_map.create_image(0, 0, anchor=tk.NW, image=self.erangel_photo)

    def load_images(self):
        folder_index = 1
        while True:
            folder_path = os.path.join(self.base_folder, str(folder_index))
            if not os.path.exists(folder_path):
                break
            self.images.extend([
                os.path.join(folder_path, f)
                for f in os.listdir(folder_path)
                if f.endswith("_loc.jpg") or f.endswith("_loc.png")
            ])
            folder_index += 1
        
        self.images.sort()
        if self.images:
            self.load_capture(self.images[0])

    def load_capture(self, path):
        image = Image.open(path)
        width, height = image.size
        ratio = min(800 / width, 600 / height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        image = image.resize((new_width, new_height), Image.LANCZOS)
        self.capture_photo = ImageTk.PhotoImage(image)
        self.canvas_capture.create_image(400, 300, anchor=tk.CENTER, image=self.capture_photo)
        self.master.title(f"Sélecteur de localisation - {os.path.basename(path)}")

    def on_click(self, event):
        x, y = event.x, event.y
        # Conversion des coordonnées du clic à l'échelle de la carte réelle
        real_x = int(x * (self.map_size / self.display_size))
        real_y = int(y * (self.map_size / self.display_size))
        
        image_id = os.path.splitext(os.path.basename(self.images[self.current_image]))[0]
        self.append_to_csv(image_id, real_x, real_y)
        print(f"Position enregistrée pour {image_id}: ({real_x}, {real_y})")
        self.next_image()

    def next_image(self):
        self.current_image += 1
        if self.current_image < len(self.images):
            self.load_capture(self.images[self.current_image])
        else:
            print("Toutes les images ont été traitées. Fermeture de l'application.")
            self.master.quit()

    def append_to_csv(self, image_id, x, y):
        file_exists = os.path.isfile(self.csv_file)
        with open(self.csv_file, "a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            if not file_exists:
                writer.writerow(["image_id", "position_x", "position_y"])
            writer.writerow([f"{image_id}", x, y])


if __name__ == "__main__":
    root = tk.Tk()
    app = LocationPicker(root)
    root.mainloop()
