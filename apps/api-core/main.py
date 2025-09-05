from fastapi import FastAPI, Request, Body

app = FastAPI()

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/")
async def root():
    return {"service": "qc-media-api", "ok": True}

@app.post("/leads")
async def create_lead(payload: dict = Body(...), request: Request = None):
    client_host = request.client.host if request and request.client else None
    return {"status": "received", "lead": payload, "from": client_host}
