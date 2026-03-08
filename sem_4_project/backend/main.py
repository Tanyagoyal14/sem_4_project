from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime

from langdetect import detect
from deep_translator import GoogleTranslator

import pandas as pd
from reportlab.pdfgen import canvas

# -----------------------------
# FastAPI Setup
# -----------------------------

app = FastAPI(
    title="AI Feedback Intelligence System",
    version="6.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------

sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

industry_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

complaint_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

# -----------------------------
# Labels
# -----------------------------

INDUSTRY_LABELS = [
    "E-commerce",
    "Banking",
    "Healthcare",
    "Education",
    "Food Delivery",
    "Travel",
    "Technology",
    "Telecom",
    "Retail",
    "Customer Support"
]

FEEDBACK_TYPES = [
    "Complaint",
    "Suggestion",
    "Praise",
    "Question"
]

# -----------------------------
# Recommendations
# -----------------------------

INDUSTRY_RECOMMENDATIONS = {

    "E-commerce": "Improve website speed and payment gateway reliability.",
    "Banking": "Improve transaction reliability and security.",
    "Healthcare": "Improve appointment scheduling systems.",
    "Education": "Improve video streaming stability.",
    "Food Delivery": "Improve delivery tracking and packaging quality.",
    "Travel": "Improve booking confirmation reliability.",
    "Technology": "Fix app crashes and improve system performance.",
    "Telecom": "Improve network stability and reduce signal drops.",
    "Retail": "Improve checkout speed and inventory accuracy.",
    "Customer Support": "Improve response time and support quality."
}

# -----------------------------
# Storage
# -----------------------------

feedback_history = []

# -----------------------------
# Request Schema
# -----------------------------

class FeedbackRequest(BaseModel):
    feedback: str


# -----------------------------
# Utility Functions
# -----------------------------

def translate_to_english(text):

    try:

        lang = detect(text)

        if lang != "en":

            translated = GoogleTranslator(
                source="auto",
                target="en"
            ).translate(text)

            return translated

    except:
        pass

    return text


def detect_feedback_type(text):

    result = complaint_classifier(
        text,
        FEEDBACK_TYPES
    )

    return {
        "type": result["labels"][0],
        "confidence": round(result["scores"][0], 3)
    }


def calculate_csat():

    if len(feedback_history) == 0:
        return 0

    positive = sum(
        1 for f in feedback_history
        if f["sentiment"] == "Positive"
    )

    total = len(feedback_history)

    return round((positive / total) * 100, 2)


# -----------------------------
# Routes
# -----------------------------

@app.get("/")
def home():
    return {"status": "AI Feedback System Running"}


# MAIN ANALYSIS ROUTE

@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    original_text = request.feedback

    translated_text = translate_to_english(original_text)

    # -------------------------
    # Sentiment Analysis
    # -------------------------

    sentiment_result = sentiment_model(translated_text)[0]

    sentiment_label = sentiment_result["label"]
    sentiment_score = round(sentiment_result["score"], 3)

    if sentiment_label == "LABEL_0":
        sentiment_label = "Negative"
    elif sentiment_label == "LABEL_1":
        sentiment_label = "Neutral"
    else:
        sentiment_label = "Positive"

    # -------------------------
    # Complaint Detection
    # -------------------------

    feedback_type = detect_feedback_type(translated_text)

    # -------------------------
    # Industry Prediction
    # -------------------------

    industry_result = industry_classifier(
        translated_text,
        INDUSTRY_LABELS,
        multi_label=True
    )

    labels = industry_result["labels"]
    scores = industry_result["scores"]

    industries = []

    for label, score in zip(labels, scores):

        industries.append({
            "industry": label,
            "confidence": round(score, 3)
        })

    industries = sorted(
        industries,
        key=lambda x: x["confidence"],
        reverse=True
    )

    top_industries = industries[:3]

    # -------------------------
    # Recommendations
    # -------------------------

    recommendations = []

    for item in top_industries:

        industry = item["industry"]

        if industry in INDUSTRY_RECOMMENDATIONS:

            recommendations.append({
                "industry": industry,
                "recommendation": INDUSTRY_RECOMMENDATIONS[industry]
            })

    # -------------------------
    # Save Feedback
    # -------------------------

    feedback_history.append({

        "feedback": translated_text,
        "sentiment": sentiment_label,
        "type": feedback_type["type"],
        "timestamp": datetime.now().isoformat()

    })

    csat = calculate_csat()

    # -------------------------
    # Response
    # -------------------------

    return {

        "original_feedback": original_text,
        "translated_feedback": translated_text,

        "sentiment": sentiment_label,
        "sentiment_confidence": sentiment_score,

        "feedback_type": feedback_type["type"],
        "feedback_type_confidence": feedback_type["confidence"],

        "top_industries": top_industries,

        "recommendations": recommendations,

        "csat_score": csat,

        "timestamp": datetime.now().isoformat()

    }


# -----------------------------
# FEEDBACK HISTORY
# -----------------------------

@app.get("/feedback-history")
def get_feedback_history():

    return {
        "history": feedback_history
    }


# -----------------------------
# EXPORT REPORTS
# -----------------------------

@app.get("/export/csv")
def export_csv():

    df = pd.DataFrame(feedback_history)

    file_path = "feedback_report.csv"

    df.to_csv(file_path, index=False)

    return {"message": "CSV report generated"}


@app.get("/export/excel")
def export_excel():

    df = pd.DataFrame(feedback_history)

    file_path = "feedback_report.xlsx"

    df.to_excel(file_path, index=False)

    return {"message": "Excel report generated"}


@app.get("/export/pdf")
def export_pdf():

    file_path = "feedback_report.pdf"

    c = canvas.Canvas(file_path)

    y = 800

    for item in feedback_history:

        text = f"{item['feedback']} | {item['sentiment']} | {item['type']}"

        c.drawString(50, y, text)

        y -= 20

    c.save()

    return {"message": "PDF report generated"}