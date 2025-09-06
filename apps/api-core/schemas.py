from pydantic import BaseModel, Field
from typing import List, Optional

class OfferBase(BaseModel):
    name: str = Field(..., min_length=2)
    summary: str = Field(..., min_length=4)
    price_usd: float = Field(..., ge=0)
    features: List[str]

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    price_usd: Optional[float] = None
    features: Optional[List[str]] = None

class OfferOut(OfferBase):
    id: int
    class Config:
        from_attributes = True
