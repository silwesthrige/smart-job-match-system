import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from .db import db

router = APIRouter()

SECRET_KEY = os.getenv('SECRET_KEY', 'change-this-secret')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post('/signup')
async def signup(req: SignupRequest):
    existing = await db.users.find_one({'email': req.email})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    hashed = get_password_hash(req.password)
    user = {
        'email': req.email,
        'hashed_password': hashed,
        'name': req.name,
        'created_at': datetime.utcnow()
    }
    res = await db.users.insert_one(user)
    return {'user_id': str(res.inserted_id)}


@router.post('/login', response_model=Token)
async def login(req: LoginRequest):
    user = await db.users.find_one({'email': req.email})
    if not user:
        raise HTTPException(status_code=400, detail='Invalid credentials')
    if not verify_password(req.password, user.get('hashed_password', '')):
        raise HTTPException(status_code=400, detail='Invalid credentials')
    token = create_access_token({'sub': str(user.get('_id'))})
    return {'access_token': token, 'token_type': 'bearer'}
