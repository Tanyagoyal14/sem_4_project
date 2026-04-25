import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "").strip()
DB_NAME = os.getenv("DB_NAME", "feedbackDB")
TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "5000"))


@lru_cache(maxsize=1)
def get_client() -> MongoClient:
    if not MONGO_URI:
        raise RuntimeError(
            "MONGO_URI is not set. Add your MongoDB Atlas connection string to backend/.env."
        )

    return MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=TIMEOUT_MS,
        connectTimeoutMS=TIMEOUT_MS,
        retryWrites=True,
    )


@lru_cache(maxsize=1)
def get_database() -> Database:
    return get_client()[DB_NAME]


db = get_database()
users_collection: Collection = db["users"]
feedback_collection: Collection = db["feedback"]
profiles_collection: Collection = db["profiles"]
youtube_compare_cache_collection: Collection = db["youtube_compare_cache"]
youtube_compare_history_collection: Collection = db["youtube_compare_history"]

# Legacy alias kept for compatibility with older imports.
profile_collection = profiles_collection


def ensure_indexes() -> None:
    users_collection.create_index("email", unique=True)
    feedback_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    feedback_collection.create_index([("created_at", DESCENDING)])
    youtube_compare_cache_collection.create_index("cache_key", unique=True)
    youtube_compare_cache_collection.create_index([("updated_at", DESCENDING)])
    youtube_compare_history_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    youtube_compare_history_collection.create_index([("created_at", DESCENDING)])


def ping_database() -> bool:
    get_client().admin.command("ping")
    return True
