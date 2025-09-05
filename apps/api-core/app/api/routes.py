from typing import Any
from fastapi import APIRouter, Query

router = APIRouter()

_FAKE_DB = [
    {"id": 1, "name": "First Item"},
    {"id": 2, "name": "Second Item"},
]

@router.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}

@router.get("/version", tags=["meta"])
async def version() -> dict[str, str]:
    return {"version": "0.1.0"}

@router.get("/echo", tags=["demo"])
async def echo(q: str = Query(..., min_length=1)) -> dict[str, Any]:
    return {"you_said": q}

@router.get("/items", tags=["demo"])
async def list_items() -> list[dict[str, Any]]:
    return _FAKE_DB

@router.get("/items/{item_id}", tags=["demo"])
async def get_item(item_id: int) -> dict[str, Any]:
    for row in _FAKE_DB:
        if row["id"] == item_id:
            return row
    return {"error": "not found"}
