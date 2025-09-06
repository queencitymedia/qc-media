from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
DB = {}  # in-memory store

class Offer(BaseModel):
    id: str
    name: str
    price: float

@app.get("/offers")
def list_offers():
    return list(DB.values())

@app.post("/offers")
def create_offer(offer: Offer):
    DB[offer.id] = offer.dict()
    return DB[offer.id]

@app.get("/offers/{id}")
def get_offer(id: str):
    return DB.get(id) or {"error": "not found"}

@app.put("/offers/{id}")
def put_offer(id: str, offer: Offer):
    DB[id] = offer.dict()
    return DB[id]

@app.delete("/offers/{id}")
def delete_offer(id: str):
    DB.pop(id, None)
    return {"ok": True}
