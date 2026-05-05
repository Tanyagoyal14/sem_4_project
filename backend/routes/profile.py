from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from db import profile_collection
from models import ProfileModel
from security import normalize_email

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/save-profile")
def save_profile(profile: ProfileModel):
    try:
        payload = profile.model_dump()
        payload["email"] = normalize_email(payload["email"])

        profile_collection.update_one(
            {"email": payload["email"]},
            {"$set": payload},
            upsert=True,
        )

        return {"message": "Profile saved successfully"}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.get("/get-profile")
def get_profile(email: str):
    try:
        document = profile_collection.find_one(
            {"email": normalize_email(email)},
            {"_id": 0},
        )
        return document or {}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc
