import shutil

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from src.database import IMAGES_FOLDER, add_image, get_random_image

app = FastAPI()


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_path = IMAGES_FOLDER / file.filename
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        add_image(file.filename, str(file_path))
        return {"filename": file.filename, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/random-image")
async def get_image():
    image = get_random_image()
    if image:
        return FileResponse(image["path"])
    raise HTTPException(status_code=404, detail="No images found")


@app.get("/")
async def root():
    return {"message": "VirtualGuessr API is running"}
