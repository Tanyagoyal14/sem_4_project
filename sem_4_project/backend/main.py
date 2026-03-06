from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------
# Load Models
# ---------------------------------

try:

    sentiment_model = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english"
    )

    classifier = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli"
    )

except Exception as e:
    print("Model loading error:", e)

# ---------------------------------
# Industry Labels
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
# Recommendation Engine
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
    feedback: str = Field(..., min_length=3, max_length=500)

# ---------------------------------
# Routes
# ---------------------------------

@app.get("/")
def home():
    return {"status": "Advanced AI System Running"}

# ---------------------------------
# Main Analysis Endpoint
# ---------------------------------

@app.post("/analyze-feedback")
def analyze_feedback(request: FeedbackRequest):

    try:

        text = request.feedback

        # Sentiment Analysis
        sentiment_result = sentiment_model(text)[0]

        sentiment = sentiment_result["label"]
        sentiment_confidence = round(sentiment_result["score"], 3)

        # Multi-label Classification
        classification_result = classifier(
            text,
            COMPANY_LABELS,
            multi_label=True
        )

        labels = classification_result["labels"]
        scores = classification_result["scores"]

        industry_confidence = [
            {
                "industry": label,
                "confidence": round(score, 3)
            }
            for label, score in zip(labels, scores)
        ]

        industry_confidence.sort(
            key=lambda x: x["confidence"],
            reverse=True
        )

        top_industries = industry_confidence[:3]

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

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

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

    visualization_data.sort(
        key=lambda x: x["confidence_score"],
        reverse=True
    )

    return {
        "feedback": text,
        "confidence_distribution_percent": visualization_data
    }