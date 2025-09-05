from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import get_settings
from app.api.routes import router as api_router

settings = get_settings()
app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple root health
@app.get("/health")
def health():
    return {"ok": True, "env": settings.ENV}

# mount all API routes under the prefix (e.g., /api)
app.include_router(api_router, prefix=settings.API_PREFIX)

# legacy hello kept so your Next.js page still works
@app.get(f"{settings.API_PREFIX}/hello")
def hello(name: str = "world"):
    return {"message": f"Hello, {name}!"}
