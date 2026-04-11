from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime, timedelta
from fastapi.encoders import jsonable_encoder
import pandas as pd
from typing import Optional, List

# 🔥 MongoDB imports
from database import feedback_collection, profile_collection

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
# MODELS
# -------------------------

class FeedbackRequest(BaseModel):
    feedback: Optional[str] = None
    feedback: Optional[List[str]] = None

class ProfileModel(BaseModel):
    name: str
    email: str
    company: str
    role: str
    avatar: str

# -------------------------
# AI MODELS
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
# ANALYZE FEEDBACK
# -------------------------

@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    # 🔥 HANDLE BOTH INPUT TYPES
    if request.feedback:
        feedback_list = [request.feedback]

    elif request.feedbacks:
        feedback_list = request.feedbacks

    else:
        return {"error": "No feedback provided"}

    results = []

    for text in feedback_list:

        # ---------------- SENTIMENT ----------------
        sentiment_result = sentiment_model(text)[0]
        sentiment = sentiment_result["label"].capitalize()
        confidence = sentiment_result["score"]

        # ---------------- INDUSTRY ----------------
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

        # ---------------- TYPE ----------------
        type_result = classifier(text, feedback_types)
        feedback_type = type_result["labels"][0]

        # ---------------- CSAT ----------------
        csat_score = (
            100 if sentiment == "Positive"
            else 50 if sentiment == "Neutral"
            else 30
        )

        # ---------------- SAVE ----------------
        feedback_collection.insert_one({
            "feedback": text,
            "sentiment": sentiment,
            "confidence": confidence,
            "top_industries": top_industries,
            "feedback_type": feedback_type,
            "timestamp": datetime.now()
        })

        results.append({
            "feedback": text,
            "sentiment": sentiment,
            "top_industries": top_industries,
            "feedback_type": feedback_type,
            "csat_score": csat_score
        })

    return {
        "results": results,
        "total": len(results)
    }

# -------------------------
# FEEDBACK HISTORY
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

# -------------------------
# PROFILE APIs
# -------------------------

@app.post("/save-profile")
def save_profile(profile: ProfileModel):

    profile_collection.update_one(
        {"email": profile.email},
        {"$set": profile.dict()},
        upsert=True
    )

    return {"message": "Profile saved successfully"}

@app.get("/get-profile")
def get_profile(email: str):

    data = profile_collection.find_one(
        {"email": email},
        {"_id": 0}
    )

    return data or {}

# -------------------------
# WEEKLY REPORT DOWNLOAD
# -------------------------

@app.get("/download-weekly-report")
def download_weekly_report(format: str = "csv"):

    last_week = datetime.now() - timedelta(days=7)

    data = list(
        feedback_collection.find(
            {"timestamp": {"$gte": last_week}},
            {"_id": 0}
        )
    )

    if not data:
        return {"error": "No data available in last 7 days"}

    df = pd.DataFrame(data)

    file_path = f"weekly_report.{format}"

    # CSV
    if format == "csv":
        df.to_csv(file_path, index=False)

    # Excel
    elif format == "excel":
        df.to_excel(file_path, index=False)

    # PDF
    elif format == "pdf":
        from reportlab.platypus import SimpleDocTemplate, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet

        doc = SimpleDocTemplate(file_path)
        styles = getSampleStyleSheet()
        content = []

        for row in data[:20]:
            text = f"""
            Feedback: {row.get('feedback')}<br/>
            Sentiment: {row.get('sentiment')}<br/>
            Type: {row.get('feedback_type')}<br/><br/>
            """
            content.append(Paragraph(text, styles["Normal"]))

        doc.build(content)

    else:
        return {"error": "Invalid format"}

    return FileResponse(path=file_path, filename=file_path)