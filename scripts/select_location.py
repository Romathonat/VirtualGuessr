import csv
import os
import tkinter as tk
from tkinter import filedialog

from PIL import Image, ImageTk


class LocationPicker:
    def __init__(self, master):
        self.master = master
        self.master.title("Location Picker")

        self.canvas = tk.Canvas(master, width=1200, height=1200)
        self.canvas.pack()

        self.load_button = tk.Button(
            master, text="Charger les images", command=self.load_images
        )
        self.load_button.pack()

        self.images = []
        self.current_image = 0
        self.csv_file = "positions.csv"
        self.image_folder = ""

        self.canvas.bind("<Button-1>", self.on_click)

        self.display_size = 1200
        self.map_size = 8192

    def load_images(self):
        self.image_folder = filedialog.askdirectory(
            title="Sélectionner le dossier des images de localisation"
        )
        if self.image_folder:
            self.images = [
                f
                for f in os.listdir(self.image_folder)
                if f.endswith("_loc.jpg") or f.endswith("_loc.png")
            ]
            self.images.sort()  # Trier les images par ordre alphabétique
            if self.images:
                self.load_image(os.path.join(self.image_folder, self.images[0]))
                self.load_button.config(state=tk.DISABLED)

    def load_image(self, path):
        image = Image.open(path)
        image = image.resize((self.display_size, self.display_size), Image.LANCZOS)
        self.photo = ImageTk.PhotoImage(image)
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.photo)
        self.master.title(f"Location Picker - {os.path.basename(path)}")

    def on_click(self, event):
        x, y = event.x, event.y
        map_x, map_y = self.convert_coordinates(x, y)
        image_id = os.path.splitext(self.images[self.current_image])[0]
        self.append_to_csv(image_id, map_x, map_y)
        print(f"Position enregistrée pour {image_id}: ({map_x}, {map_y})")
        self.next_image()

    def convert_coordinates(self, x, y):
        map_x = int((x / self.display_size) * self.map_size)
        map_y = int((y / self.display_size) * self.map_size)
        return map_x, map_y

    def next_image(self):
        self.current_image += 1
        if self.current_image < len(self.images):
            self.load_image(
                os.path.join(self.image_folder, self.images[self.current_image])
            )
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
