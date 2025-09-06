from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from db import Base, engine, SessionLocal
from models import Offer
from schemas import OfferCreate, OfferUpdate, OfferOut

app = FastAPI()

# --- DB init ---
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}

def _to_out(o: Offer) -> OfferOut:
    return OfferOut(
        id=o.id,
        name=o.name,
        summary=o.summary,
        price_usd=o.price_usd,
        features=o.features.split("\n") if o.features else [],
    )

@app.get("/offers", response_model=List[OfferOut])
def list_offers(db: Session = Depends(get_db)):
    rows = db.query(Offer).order_by(Offer.id.asc()).all()
    return [_to_out(r) for r in rows]

@app.get("/offers/{offer_id}", response_model=OfferOut)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    o = db.get(Offer, offer_id)
    if not o:
        raise HTTPException(status_code=404, detail="Offer not found")
    return _to_out(o)

@app.post("/offers", response_model=OfferOut, status_code=201)
def create_offer(payload: OfferCreate, db: Session = Depends(get_db)):
    o = Offer(
        name=payload.name,
        summary=payload.summary,
        price_usd=payload.price_usd,
        features="\n".join(payload.features),
    )
    db.add(o)
    db.commit()
    db.refresh(o)
    return _to_out(o)

@app.put("/offers/{offer_id}", response_model=OfferOut)
def update_offer(offer_id: int, payload: OfferUpdate, db: Session = Depends(get_db)):
    o = db.get(Offer, offer_id)
    if not o:
        raise HTTPException(status_code=404, detail="Offer not found")

    if payload.name is not None: o.name = payload.name
    if payload.summary is not None: o.summary = payload.summary
    if payload.price_usd is not None: o.price_usd = payload.price_usd
    if payload.features is not None: o.features = "\n".join(payload.features)

    db.commit()
    db.refresh(o)
    return _to_out(o)

@app.delete("/offers/{offer_id}", status_code=204)
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    o = db.get(Offer, offer_id)
    if not o:
        raise HTTPException(status_code=404, detail="Offer not found")
    db.delete(o)
    db.commit()
    return
