from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import json
from pathlib import Path

app = FastAPI(title="QC Media API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Offer(BaseModel):
    id: str
    name: str
    summary: str
    price_usd: float
    features: List[str]

DATA_DIR = Path(__file__).parent / "data"
OFFERS_FILE = DATA_DIR / "offers.json"

def load_offers() -> List[Offer]:
    if not OFFERS_FILE.exists():
        return []
    data = json.loads(OFFERS_FILE.read_text(encoding="utf-8"))
    return [Offer(**o) for o in data]

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})

@app.get("/offers", response_model=List[Offer])
async def get_offers():
    return load_offers()

@app.get("/offers/{offer_id}", response_model=Offer)
async def get_offer(offer_id: str):
    for o in load_offers():
        if o.id == offer_id:
            return o
    raise HTTPException(status_code=404, detail="Offer not found")