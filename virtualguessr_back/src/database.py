import sqlite3
from pathlib import Path

# Chemin de la base de données
DB_PATH = Path(__file__).parent.parent / "db" / "images.db"

# Chemin du dossier des images
IMAGES_FOLDER = Path(__file__).parent.parent / "images"


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
        path TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()


def add_image(filename, path):
    conn = get_db()
    conn.execute("INSERT INTO images (filename, path) VALUES (?, ?)", (filename, path))
    conn.commit()
    conn.close()


def get_random_image():
    conn = get_db()
    result = conn.execute("SELECT * FROM images ORDER BY RANDOM() LIMIT 1").fetchone()
    conn.close()
    return result if result else None


# Assurez-vous que le dossier images existe
IMAGES_FOLDER.mkdir(exist_ok=True)

# Initialiser la base de données au démarrage
init_db()
