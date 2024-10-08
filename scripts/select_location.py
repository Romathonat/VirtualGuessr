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

        self.next_button = tk.Button(
            master, text="Image suivante", command=self.next_image, state=tk.DISABLED
        )
        self.next_button.pack()

        self.images = []
        self.current_image = 0
        self.positions = {}

        self.canvas.bind("<Button-1>", self.on_click)

    def load_images(self):
        folder = filedialog.askdirectory(
            title="Sélectionner le dossier des images de localisation"
        )
        if folder:
            self.images = [
                f
                for f in os.listdir(folder)
                if f.endswith("_loc.jpg") or f.endswith("_loc.png")
            ]
            self.images.sort()  # Trier les images par ordre alphabétique
            if self.images:
                self.load_image(os.path.join(folder, self.images[0]))
                self.next_button.config(state=tk.NORMAL)

    def load_image(self, path):
        image = Image.open(path)
        image = image.resize((1200, 1200), Image.LANCZOS)
        self.photo = ImageTk.PhotoImage(image)
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.photo)
        self.master.title(f"Location Picker - {os.path.basename(path)}")

    def next_image(self):
        self.current_image += 1
        if self.current_image < len(self.images):
            self.load_image(
                os.path.join(
                    os.path.dirname(self.images[0]), self.images[self.current_image]
                )
            )
        else:
            self.save_positions()
            self.master.quit()

    def on_click(self, event):
        x, y = event.x, event.y
        image_id = os.path.splitext(self.images[self.current_image])[0]
        self.positions[image_id] = (x, y)
        print(f"Position enregistrée pour {image_id}: ({x}, {y})")
        self.next_image()

    def save_positions(self):
        with open("positions.csv", "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["image_id", "position_x", "position_y"])
            for image_id, (x, y) in self.positions.items():
                writer.writerow([image_id, x, y])
        print("Positions sauvegardées dans positions.csv")


root = tk.Tk()
app = LocationPicker(root)
root.mainloop()
