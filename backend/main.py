

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime, timedelta
from typing import Optional, List

from langdetect import detect
from deep_translator import GoogleTranslator

import pandas as pd
from fastapi import UploadFile, File
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

# -----------------------------
# APP SETUP
# -----------------------------

app = FastAPI(title="AI Feedback Intelligence System", version="7.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔥 NEW MAIN.PY LOADED 🔥")

# -----------------------------
# MODELS
# -----------------------------

class FeedbackRequest(BaseModel):
    feedback: Optional[str] = None
    feedbacks: Optional[List[str]] = None

# -----------------------------
# AI MODELS
# -----------------------------

sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

# -----------------------------
# LABELS
# -----------------------------

INDUSTRIES = [
    "E-commerce", "Banking", "Healthcare", "Education",
    "Food Delivery", "Travel", "Technology", "Telecom",
    "Retail", "Customer Support"
]

FEEDBACK_TYPES = ["Complaint", "Suggestion", "Praise", "Question"]

# -----------------------------
# STORAGE
# -----------------------------

feedback_history = []

# -----------------------------
# UTIL FUNCTIONS
# -----------------------------

def translate(text):
    try:
        if detect(text) != "en":
            return GoogleTranslator(source="auto", target="en").translate(text)
    except:
        pass
    return text


def get_sentiment(text):
    result = sentiment_model(text)[0]

    label = result["label"]

    if label == "LABEL_0":
        return "Negative"
    elif label == "LABEL_1":
        return "Neutral"
    return "Positive"


def calculate_csat():
    if not feedback_history:
        return 0

    positive = sum(1 for f in feedback_history if f["sentiment"] == "Positive")
    return round((positive / len(feedback_history)) * 100, 2)

# -----------------------------
# HOME
# -----------------------------

@app.get("/")
def home():
    return {"status": "Backend Running 🚀"}

# -----------------------------
# ANALYZE FEEDBACK
# -----------------------------

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

        translated = translate(text)

        sentiment = get_sentiment(translated)

        # Industry
        # Industry classification
        industry_result = classifier(
    translated,
    candidate_labels=INDUSTRIES
)

        labels = industry_result.get("labels", [])
        scores = industry_result.get("scores", [])

        top_industries = [
            {"industry": l, "confidence": round(s, 3)}
            for l, s in zip(labels, scores)
        ][:3]

# Feedback type
        type_result = classifier(
            translated,
            candidate_labels=FEEDBACK_TYPES
        )

        feedback_type = type_result.get("labels", ["Unknown"])[0]

        csat = 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30

        # Save
        feedback_history.append({
            "feedback": translated,
            "sentiment": sentiment,
            "type": feedback_type,
            "timestamp": datetime.now().isoformat()
        })

        results.append({
            "feedback": text,
            "translated": translated,
            "sentiment": sentiment,
            "feedback_type": feedback_type,
            "top_industries": top_industries,
            "csat_score": csat
        })

    return {
        "results": results,
        "total": len(results)
    }

import pandas as pd
from fastapi import UploadFile, File

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    if 'feedback' not in df.columns:
        return {"error": "CSV must contain 'feedback' column"}

    feedbacks = df['feedback'].dropna().astype(str).tolist()

    # 🔥 STEP 1: Translate all
    translated_texts = [translate(t) for t in feedbacks]

    # 🔥 STEP 2: Batch sentiment
    sentiment_outputs = sentiment_model(translated_texts, batch_size=16)

    # 🔥 STEP 3: Batch classification
    industry_outputs = classifier(
        translated_texts,
        candidate_labels=INDUSTRIES,
        batch_size=8
    )

    type_outputs = classifier(
        translated_texts,
        candidate_labels=FEEDBACK_TYPES,
        batch_size=32
    )

    results = []

    for i, text in enumerate(feedbacks):

        # Sentiment
        label = sentiment_outputs[i]["label"]
        sentiment = (
            "Negative" if label == "LABEL_0"
            else "Neutral" if label == "LABEL_1"
            else "Positive"
        )

        # Industry
        labels = industry_outputs[i]["labels"]
        scores = industry_outputs[i]["scores"]

        top_industries = [
            {"industry": l, "confidence": round(s, 3)}
            for l, s in zip(labels, scores)
        ][:3]

        # Feedback type
        feedback_type = type_outputs[i]["labels"][0]

        csat = 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30

        results.append({
            "feedback": text,
            "translated": translated_texts[i],
            "sentiment": sentiment,
            "feedback_type": feedback_type,
            "top_industries": top_industries,
            "csat_score": csat
        })

    return {"results": results}
# -----------------------------
# HISTORY
# -----------------------------

@app.get("/feedback-history")
def get_history():
    return {"history": feedback_history}

# -----------------------------
# DOWNLOAD REPORT
# -----------------------------

@app.get("/download-weekly-report")
def download_report(format: str = "csv"):

    if not feedback_history:
        return {"error": "No data available"}

    df = pd.DataFrame(feedback_history)

    file_path = f"report.{format}"

    # CSV
    if format == "csv":
        df.to_csv(file_path, index=False)

    # Excel
    elif format == "excel":
        df.to_excel(file_path, index=False)

    # PDF
    elif format == "pdf":

        doc = SimpleDocTemplate(file_path)
        styles = getSampleStyleSheet()

        content = []

        for row in feedback_history[:20]:
            text = f"""
            Feedback: {row['feedback']}<br/>
            Sentiment: {row['sentiment']}<br/>
            Type: {row['type']}<br/><br/>
            """
            content.append(Paragraph(text, styles["Normal"]))

        doc.build(content)

    else:
        return {"error": "Invalid format"}

    return FileResponse(path=file_path, filename=file_path)