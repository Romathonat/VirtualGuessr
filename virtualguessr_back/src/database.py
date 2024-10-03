import os
import sqlite3
from pathlib import Path

DB_PATH = Path("/virtualguessr_back/data/virtualguessr.db")
IMAGES_FOLDER = Path("/virtualguessr_back/images")


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        data BLOB NOT NULL
    )
    """)

    for filename in os.listdir(IMAGES_FOLDER):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
            file_path = IMAGES_FOLDER / filename
            with open(file_path, "rb") as file:
                blob_data = file.read()
            try:
                conn.execute(
                    "INSERT OR REPLACE INTO images (filename, data) VALUES (?, ?)",
                    (filename, blob_data),
                )
            except sqlite3.IntegrityError:
                print(f"Erreur lors de l'insertion de l'image {filename}")

    conn.commit()
    conn.close()


def get_random_image():
    conn = get_db()
    result = conn.execute(
        "SELECT filename, data FROM images ORDER BY RANDOM() LIMIT 1"
    ).fetchone()
    conn.close()
    return result if result else None


# Assurez-vous que les dossiers nécessaires existent
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
IMAGES_FOLDER.mkdir(parents=True, exist_ok=True)

# Initialiser la base de données au démarrage
init_db()
