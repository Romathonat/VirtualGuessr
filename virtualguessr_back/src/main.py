from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Response

from src.database import get_random_image, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/random-image")
async def get_image():
    image = get_random_image()
    if image:
        return Response(
            content=image["data"],
            media_type=f"image/{image['filename'].split('.')[-1]}",
        )
    raise HTTPException(status_code=404, detail="Aucune image trouvée")


@app.get("/")
async def root():
    return {"message": "VirtualGuessr API is running"}
