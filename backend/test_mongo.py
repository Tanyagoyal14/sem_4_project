from pymongo import MongoClient

uri = "mongodb+srv://ayushib905:root@cluster0.qnlntm5.mongodb.net/feedbackDB?retryWrites=true&w=majority"

client = MongoClient(uri)

db = client["feedbackDB"]
collection = db["feedbacks"]

collection.insert_one({"feedback": "test feedback"})

print(client.list_database_names())
