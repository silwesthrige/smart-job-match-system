from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CV(BaseModel):
    filename: str
    text: str
    embedding: List[float]
    created_at: Optional[datetime]

class Job(BaseModel):
    title: str
    company: Optional[str]
    url: Optional[str]
    description: str
    embedding: List[float]
    created_at: Optional[datetime]
