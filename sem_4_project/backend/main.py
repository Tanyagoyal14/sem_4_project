from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime

# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(
    title="Advanced AI Feedback Intelligence System",
    description="Multi-label Classification + Recommendations + Confidence",
    version="3.0"
)

# ---------------------------------
# Load Models
# ---------------------------------

# Sentiment Model
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# Zero-shot multi-label classifier
classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

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
# Industry Recommendation Engine
# ---------------------------------

INDUSTRY_RECOMMENDATIONS = {
    "E-commerce": "Improve website speed, checkout reliability, and payment gateway stability.",
    "Banking": "Enhance transaction security, reduce transfer failures, and optimize mobile app performance.",
    "Healthcare": "Improve appointment scheduling, patient communication, and system reliability.",
    "Education": "Enhance video streaming quality and reduce platform lag during live sessions.",
    "Food Delivery": "Improve delivery time accuracy, food packaging quality, and real-time tracking.",
    "Travel": "Improve booking confirmation speed and customer support response time.",
    "Technology": "Fix app crashes, improve UI responsiveness, and enhance system performance.",
    "Telecom": "Improve network stability and reduce call/data drop rates.",
    "Retail": "Enhance inventory accuracy and checkout efficiency."
}

# ---------------------------------
# Schema
# ---------------------------------

class FeedbackRequest(BaseModel):
    feedback: str

# ---------------------------------
# Routes
# ---------------------------------

@app.get("/")
def home():
    return {"status": "Advanced AI System Running"}

@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    text = request.feedback

    # -------- Sentiment --------
    sentiment_result = sentiment_model(text)[0]
    sentiment = sentiment_result["label"]
    sentiment_confidence = round(sentiment_result["score"], 3)

    # -------- Multi-label classification --------
    classification_result = classifier(
        text,
        COMPANY_LABELS,
        multi_label=True
    )

    labels = classification_result["labels"]
    scores = classification_result["scores"]

    # Pair labels with confidence
    industry_confidence = [
        {
            "industry": label,
            "confidence": round(score, 3)
        }
        for label, score in zip(labels, scores)
    ]

    # Sort by highest confidence
    industry_confidence = sorted(
        industry_confidence,
        key=lambda x: x["confidence"],
        reverse=True
    )

    # Top 3 industries
    top_industries = industry_confidence[:3]

    # Generate recommendations for top industries
    recommendations = []
    for item in top_industries:
        industry = item["industry"]
        if industry in INDUSTRY_RECOMMENDATIONS:
            recommendations.append({
                "industry": industry,
                "recommendation": INDUSTRY_RECOMMENDATIONS[industry]
            })

    return {
        "feedback": text,
        "sentiment": sentiment,
        "sentiment_confidence": sentiment_confidence,
        "top_industries": top_industries,
        "recommendations": recommendations,
        "timestamp": datetime.now().isoformat()
    }


# ---------------------------------
# Confidence Visualization Endpoint
# ---------------------------------

@app.post("/industry-confidence")
def industry_confidence_visual(request: FeedbackRequest):

    text = request.feedback

    classification_result = classifier(
        text,
        COMPANY_LABELS,
        multi_label=True
    )

    labels = classification_result["labels"]
    scores = classification_result["scores"]

    visualization_data = [
        {
            "industry": label,
            "confidence_score": round(score * 100, 2)
        }
        for label, score in zip(labels, scores)
    ]

    return {
        "feedback": text,
        "confidence_distribution_percent": visualization_data
    }