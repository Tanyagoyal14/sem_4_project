import os
from db import db 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import ensure_indexes, ping_database
from routes.auth import router as auth_router
from routes.feedback import router as feedback_router
from routes.profile import router as profile_router
from routes.youtube_compare import router as youtube_compare_router

app = FastAPI(title="AI Feedback Intelligence System", version="9.0")

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    try:
        ensure_indexes()
        ping_database()
        print("MongoDB connected and indexes ensured.")
    except RuntimeError as exc:
        print(f"MongoDB configuration error: {exc}")
    except Exception as exc:
        print(f"MongoDB startup check failed: {exc}")


app.include_router(auth_router)
app.include_router(feedback_router)
app.include_router(profile_router)
app.include_router(youtube_compare_router)


@app.get("/")
def home():
    return {"status": "Backend Running"}
@app.get("/check-db")
def check_db():
    try:
        result = db["test"].insert_one({"test": "working"})
        data = db["test"].find_one({"_id": result.inserted_id})

        return {
            "status": "connected",
            "data": str(data)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
