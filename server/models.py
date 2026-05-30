from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserSignup(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SkillInfo(BaseModel):
    name: str
    match: bool = False


class CVData(BaseModel):
    skills: List[str] = []
    experience: List[str] = []
    education: List[str] = []
    certifications: List[str] = []
    years_of_experience: float = 0.0


class CV(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    filename: str
    text: str
    extracted_data: CVData
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Job(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    company: Optional[str] = None
    url: Optional[str] = None
    description: str
    skills: List[str] = []
    location: Optional[str] = "Remote"
    salary: Optional[str] = None
    type: Optional[str] = "Full-time"
    posted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# FIX #4: added location, type, salary fields so frontend can display them
class MatchResult(BaseModel):
    job_id: str
    title: str
    company: Optional[str] = None
    url: Optional[str] = None
    location: Optional[str] = "Remote"       # ← NEW
    type: Optional[str] = "Full-time"        # ← NEW
    salary: Optional[str] = None             # ← NEW
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    skill_gap: List[str]


class SkillGapResponse(BaseModel):
    cv_skills: List[str]
    aggregated_needed_skills: List[str]
    skill_gap: List[Dict[str, str]]           # [{skill, priority}]
    recommendations: List[Dict[str, str]]     # [{title, url}]