from pymongo import MongoClient

MONGO_URI = "mongodb+srv://ayushib905:root@cluster0.qnlntm5.mongodb.net/feedbackDB?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)

db = client["feedbackDB"]
collection = db["feedbacks"]
