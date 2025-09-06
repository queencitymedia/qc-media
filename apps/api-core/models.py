from sqlalchemy import Column, Integer, String, Float
from db import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    summary = Column(String, nullable=False)
    price_usd = Column(Float, nullable=False, default=0.0)
    # store features as newline-separated text for simplicity
    features = Column(String, nullable=False, default="")
