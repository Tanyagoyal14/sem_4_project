from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError, PyMongoError

from db import users_collection
from models import AuthResponse, DeductCreditsRequest, LoginRequest, SignupRequest, UserPublic
from security import (
    create_access_token,
    get_current_user,
    hash_password,
    normalize_email,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(document: dict) -> UserPublic:
    return UserPublic(
        id=str(document["_id"]),
        email=document["email"],
        role=document.get("role", "free"),
        credits=int(document.get("credits", 200)),
        created_at=document["created_at"],
    )


def build_auth_response(document: dict, message: str) -> AuthResponse:
    user = serialize_user(document)
    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
        }
    )
    return AuthResponse(
        message=message,
        user=user,
        access_token=token,
        token_type="bearer",
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    email = normalize_email(payload.email)

    try:
        if users_collection.find_one({"email": email}):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists",
            )

        document = {
            "email": email,
            "hashed_password": hash_password(payload.password),
            "role": payload.role,
            "credits": 200,
            "created_at": datetime.utcnow(),
        }

        inserted = users_collection.insert_one(document)
        document["_id"] = inserted.inserted_id
        return build_auth_response(document, "Signup successful")
    except HTTPException:
        raise
    except (DuplicateKeyError, PyMongoError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection issue: {exc}",
        ) from exc


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    email = normalize_email(payload.email)

    try:
        user_document = users_collection.find_one({"email": email})
        if not user_document or not verify_password(payload.password, user_document["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        return build_auth_response(user_document, "Login successful")
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection issue: {exc}",
        ) from exc


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "role": current_user.get("role", "free"),
        "credits": int(current_user.get("credits", 200)),
        "created_at": current_user.get("created_at"),
    }


@router.post("/deduct-credits")
def deduct_credits(request: DeductCreditsRequest, current_user: dict = Depends(get_current_user)):
    try:
        current_credits = int(current_user.get("credits", 200))
        if current_credits < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient credits",
            )

        new_credits = current_credits - request.amount
        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"credits": new_credits}},
        )

        return {"message": "Credits deducted successfully", "remaining_credits": new_credits}
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection issue: {exc}",
        ) from exc
