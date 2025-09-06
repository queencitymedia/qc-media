import os
from fastapi import FastAPI
from sqlalchemy import create_engine, text

# load .env if present
try:
    from dotenv import load_dotenv; load_dotenv()
except Exception:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://qc_app:qc_dev_123@localhost:5432/qcmedia_dev")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db")
def db_check():
    with engine.connect() as conn:
        user, db = conn.execute(text("select current_user, current_database()")).one()
        return {"user": user, "db": db}
