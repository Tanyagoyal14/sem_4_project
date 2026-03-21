from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime
from fastapi.encoders import jsonable_encoder

# 🔥 MongoDB import
from database import feedback_collection

app = FastAPI()

# -------------------------
# CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Models
# -------------------------

class FeedbackRequest(BaseModel):
    feedback: str

# -------------------------
# AI Models
# -------------------------

sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

industries = [
    "E-commerce", "Banking", "Healthcare",
    "Education", "Food Delivery",
    "Technology", "Retail", "Travel", "Telecom"
]

feedback_types = [
    "Complaint", "Suggestion", "Praise", "Question"
]

# -------------------------
# API: Analyze Feedback
# -------------------------

@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    text = request.feedback

    # 1️⃣ Sentiment
    sentiment_result = sentiment_model(text)[0]
    sentiment = sentiment_result["label"].capitalize()
    confidence = sentiment_result["score"]

    # 2️⃣ Industry classification
    industry_result = classifier(text, industries)

    top_industries = [
        {
            "industry": label,
            "confidence": round(score * 100, 2)
        }
        for label, score in zip(
            industry_result["labels"],
            industry_result["scores"]
        )
    ][:3]

    # 3️⃣ Complaint detection
    type_result = classifier(text, feedback_types)
    feedback_type = type_result["labels"][0]

    # 4️⃣ Recommendation
    recommendation_map = {
        "Food Delivery": "Improve delivery speed and tracking",
        "Technology": "Fix app crashes and improve performance",
        "Banking": "Improve transaction reliability",
        "E-commerce": "Improve product quality and returns",
        "Healthcare": "Improve response time and support",
        "Education": "Enhance learning experience",
        "Retail": "Improve customer support",
        "Travel": "Improve booking experience",
        "Telecom": "Improve network stability"
    }

    recommendations = []

    if top_industries:
        industry_name = top_industries[0]["industry"]
        recommendations.append({
            "industry": industry_name,
            "recommendation": recommendation_map.get(
                industry_name,
                "Improve overall service quality"
            )
        })

    # 5️⃣ CSAT calculation (simple logic)
    csat_score = 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30

    # -------------------------
    # 🔥 SAVE TO MONGODB
    # -------------------------

    feedback_collection.insert_one({
        "feedback": text,
        "sentiment": sentiment,
        "confidence": confidence,
        "top_industries": top_industries,
        "feedback_type": feedback_type,
        "recommendations": recommendations,
        "timestamp": datetime.now()
    })

    # -------------------------
    # RESPONSE
    # -------------------------

    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "top_industries": top_industries,
        "feedback_type": feedback_type,
        "recommendations": recommendations,
        "csat_score": csat_score
    }

# -------------------------
# API: Get Feedback History
# -------------------------

@app.get("/feedback-history")
def get_feedback_history():

    data = list(
        feedback_collection
        .find({}, {"_id": 0})
        .sort("timestamp", -1)
    )

    return {
        "history": jsonable_encoder(data)
    }