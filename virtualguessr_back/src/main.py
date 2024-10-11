import os

from contextlib import asynccontextmanager
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, EmailStr
from src.database import get_random_image, init_db
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  

class SubscriberIn(BaseModel):
    email: EmailStr

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://nginx/"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/random-image")
async def get_image():
    image = get_random_image()
    if image:
        return Response(
            content=image["data"],
            media_type=f"image/{image['filename'].split('.')[-1]}",
        )
    raise HTTPException(status_code=404, detail="Aucune image trouvée")


def subscribe_to_mailerlite(email: str):
    url = "https://connect.mailerlite.com/api/subscribers"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('MAILERLITE_API_TOKEN')}"
    }
    payload = {
        "email": email,
        "status": "unconfirmed"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Ceci lèvera une exception pour les codes d'état HTTP 4xx ou 5xx
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail="Error subscribing")

@app.post("/subscribe")
async def subscribe(subscriber: SubscriberIn):
    result = subscribe_to_mailerlite(subscriber.email)
    return {"message": "Subscription successful", "details": result}