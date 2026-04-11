from pymongo import MongoClient

# -------------------------
# CONNECT TO LOCAL MONGODB
# -------------------------

client = MongoClient("mongodb://localhost:27017/")

db = client["feedback_db"]

# -------------------------
# COLLECTIONS
# -------------------------

feedback_collection = db["feedback"]
profile_collection = db["profiles"]

print("✅ MongoDB Connected")