import os
import bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from db import db
from models import UserSignup, UserLogin, Token, UserBase
from bson import ObjectId

router = APIRouter()

SECRET_KEY = os.getenv('SECRET_KEY', 'smart-match-secret-key-2024')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    try:
        # bcrypt requires bytes
        password_bytes = plain_password.encode('utf-8')
        # hashed_password might be stored as string in DB
        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode('utf-8')
        else:
            hashed_bytes = hashed_password
            
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"DEBUG: Auth verify error: {e}")
        return False

def get_password_hash(password):
    # bcrypt requires bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string for DB storage
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

@router.post('/signup', status_code=status.HTTP_201_CREATED)
async def signup(req: UserSignup):
    existing = await db.users.find_one({'email': req.email})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    print(f"DEBUG: Attempting to register user: {req.email}")
    try:
        hashed = get_password_hash(req.password)
        user = {
            'email': req.email,
            'hashed_password': hashed,
            'name': req.name,
            'created_at': datetime.utcnow()
        }
        res = await db.users.insert_one(user)
        print(f"DEBUG: User registered successfully with ID: {res.inserted_id}")
        return {'user_id': str(res.inserted_id)}
    except Exception as e:
        print(f"DEBUG: Signup failed with error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post('/login', response_model=Token)
async def login(req: UserLogin):
    user = await db.users.find_one({'email': req.email})
    if not user:
        print(f"DEBUG: Login failed - user not found: {req.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    
    if not verify_password(req.password, user.get('hashed_password', '')):
        print(f"DEBUG: Login failed - incorrect password: {req.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    
    token = create_access_token({'sub': str(user.get('_id'))})
    return {'access_token': token, 'token_type': 'bearer'}

@router.get('/me', response_model=UserBase)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
