from db import feedback_collection, ping_database


if __name__ == "__main__":
    ping_database()
    feedback_collection.insert_one({"feedback": "test feedback", "sentiment": "Neutral"})
    print("MongoDB connection OK")
