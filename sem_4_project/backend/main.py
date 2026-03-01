from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime

# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(
    title="Intelligent Customer Feedback AI",
    description="Sentiment + High-Accuracy Company Classification",
    version="2.0"
)

# ---------------------------------
# Load Models
# ---------------------------------

# Sentiment Model (BERT)
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# Zero-Shot Classification Model (HIGH ACCURACY)
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

# ---------------------------------
# Request Schema
# ---------------------------------

class FeedbackRequest(BaseModel):
    feedback: str

# ---------------------------------
# Company Categories
# ---------------------------------

COMPANY_LABELS = [
    "E-commerce",
    "Banking",
    "Healthcare",
    "Education",
    "Food Delivery",
    "Travel",
    "Technology",
    "Telecom",
    "Retail"
]

# ---------------------------------
# Routes
# ---------------------------------

@app.get("/")
def home():
    return {"status": "AI Backend running (High Accuracy Version)"}


@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    text = request.feedback

    # ---------------- Sentiment ----------------
    sentiment_result = sentiment_model(text)[0]

    sentiment = sentiment_result["label"]
    sentiment_confidence = round(sentiment_result["score"], 3)

    # ---------------- Company Classification ----------------
    classification_result = classifier(text, COMPANY_LABELS)

    predicted_company = classification_result["labels"][0]
    company_confidence = round(classification_result["scores"][0], 3)

    # Optional confidence threshold
    if company_confidence < 0.40:
        predicted_company = "Other"

    return {
        "feedback": text,
        "sentiment": sentiment,
        "sentiment_confidence": sentiment_confidence,
        "predicted_company_type": predicted_company,
        "company_confidence": company_confidence,
        "timestamp": datetime.now().isoformat()
    }