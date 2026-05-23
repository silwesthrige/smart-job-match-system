from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Smart Job Match - Backend")

class Item(BaseModel):
    name: str
    description: Optional[str] = None

@app.get("/")
async def read_root():
    return {"message": "Smart Job Match API"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/items")
async def create_item(item: Item):
    return {"item": item.dict()}
