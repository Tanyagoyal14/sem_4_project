from datetime import datetime, timedelta, timezone
import os

import bcrypt
import jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pymongo import ReturnDocument

from db import users_collection

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def create_access_token(data: dict, expires_minutes: int | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or JWT_EXPIRE_MINUTES
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = decode_access_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = users_collection.find_one({"email": email}, {"hashed_password": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def require_premium_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role", "free") != "premium":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium access required",
        )

    return current_user


def consume_user_credits(current_user: dict, amount: int = 1) -> dict:
    if amount <= 0:
        return current_user

    if current_user.get("role", "free") == "premium":
        return current_user

    user_id = current_user.get("_id")
    if not isinstance(user_id, ObjectId):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session",
        )

    updated_user = users_collection.find_one_and_update(
        {
            "_id": user_id,
            "role": {"$ne": "premium"},
            "credits": {"$gte": amount},
        },
        {"$inc": {"credits": -amount}},
        return_document=ReturnDocument.AFTER,
    )

    if updated_user:
        return updated_user

    latest_user = users_collection.find_one({"_id": user_id})
    if not latest_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if int(latest_user.get("credits", 0)) <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="You've used all 200 free credits. Upgrade to continue using the dashboard.",
        )

    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Not enough credits to complete this action.",
    )


def get_credits_remaining(current_user: dict) -> int:
    if current_user.get("role", "free") == "premium":
        return int(current_user.get("credits", 200))

    user_id = current_user.get("_id")
    if not isinstance(user_id, ObjectId):
        return int(current_user.get("credits", 0))

    latest_user = users_collection.find_one({"_id": user_id}, {"credits": 1})
    if not latest_user:
        return int(current_user.get("credits", 0))

    return int(latest_user.get("credits", 0))
