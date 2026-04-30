from datetime import datetime, timedelta
import os
import re
from typing import List, Optional
from uuid import uuid4

import pandas as pd
from deep_translator import GoogleTranslator
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from langdetect import detect
from pymongo.errors import PyMongoError
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer
from transformers import pipeline

from db import feedback_collection
from models import (
    FeedbackAnalysisItem,
    FeedbackAnalysisResponse,
    FeedbackBatchInput,
    FeedbackInput,
)
from security import consume_user_credits, get_current_user

router = APIRouter(tags=["feedback"])

sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment",
)

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
)

INDUSTRIES = [
    "E-commerce",
    "Banking",
    "Healthcare",
    "Education",
    "Food Delivery",
    "Travel",
    "Technology",
    "Telecom",
    "Retail",
    "Customer Support",
]

FEEDBACK_TYPES = ["Complaint", "Suggestion", "Praise", "Question"]

HINGLISH_MARKERS = {
    "acha",
    "accha",
    "bahut",
    "bohot",
    "bekar",
    "bura",
    "sahi",
    "jaldi",
    "der",
    "late",
    "kr",
    "kar",
    "kara",
    "nahi",
    "nhi",
    "hai",
    "tha",
    "thi",
    "mera",
    "meri",
    "mere",
    "app",
    "payment",
    "refund",
    "delivery",
    "issue",
    "problem",
    "faltu",
    "bakwas",
    "mast",
    "tatti",
    "dhanyavad",
    "shukriya",
    "samasya",
    "madad",
    "kyu",
    "kyun",
    "kaise",
    "thik",
}


def looks_like_hindi_or_hinglish(text: str) -> bool:
    lowered = text.lower()

    if re.search(r"[\u0900-\u097F]", text):
        return True

    tokens = re.findall(r"[a-zA-Z']+", lowered)
    if not tokens:
        return False

    marker_matches = sum(1 for token in tokens if token in HINGLISH_MARKERS)
    return marker_matches >= 2


def translate(text: str) -> str:
    stripped_text = text.strip()
    if not stripped_text:
        return stripped_text

    try:
        detected_language = detect(stripped_text)
    except Exception:
        detected_language = "unknown"

    needs_translation = detected_language != "en" or looks_like_hindi_or_hinglish(stripped_text)
    if not needs_translation:
        return stripped_text

    try:
        translated = GoogleTranslator(source="auto", target="en").translate(stripped_text)
        return translated or stripped_text
    except Exception:
        return stripped_text


def get_sentiment(label: str) -> str:
    if label == "LABEL_0":
        return "Negative"
    if label == "LABEL_1":
        return "Neutral"
    return "Positive"


def build_analysis(
    texts: List[str],
    user_id: Optional[str] = None,
    credits_remaining: Optional[int] = None,
    batch_id: Optional[str] = None,
    batch_name: Optional[str] = None,
    source_type: str = "manual",
) -> List[FeedbackAnalysisItem]:
    translated = [translate(text) for text in texts]

    sentiments = sentiment_model(translated, batch_size=8)
    industry_results = classifier(translated, candidate_labels=INDUSTRIES, batch_size=4)
    type_results = classifier(translated, candidate_labels=FEEDBACK_TYPES, batch_size=8)

    results: List[FeedbackAnalysisItem] = []

    for index, text in enumerate(texts):
        sentiment = get_sentiment(sentiments[index]["label"])
        top_industries = [
            {"industry": label, "confidence": round(score, 3)}
            for label, score in zip(
                industry_results[index]["labels"],
                industry_results[index]["scores"],
            )
        ][:3]
        feedback_type = type_results[index]["labels"][0]
        created_at = datetime.utcnow()
        csat_score = 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30

        document = {
            "user_id": user_id,
            "batch_id": batch_id,
            "batch_name": batch_name,
            "source_type": source_type,
            "feedback": text,
            "translated_feedback": translated[index],
            "sentiment": sentiment,
            "feedback_type": feedback_type,
            "top_industries": top_industries,
            "created_at": created_at,
        }

        inserted = feedback_collection.insert_one(document)

        results.append(
            FeedbackAnalysisItem(
                id=str(inserted.inserted_id),
                user_id=user_id,
                batch_id=batch_id,
                batch_name=batch_name,
                source_type=source_type,
                feedback=text,
                translated_feedback=translated[index],
                sentiment=sentiment,
                feedback_type=feedback_type,
                top_industries=top_industries,
                csat_score=csat_score,
                created_at=created_at,
                credits_remaining=credits_remaining,
            )
        )

    return results


@router.post("/feedback", response_model=FeedbackAnalysisItem)
def create_feedback(
    payload: FeedbackInput,
    current_user: dict = Depends(get_current_user),
):
    try:
        updated_user = consume_user_credits(current_user, 1)
        remaining = int(updated_user.get("credits", 0))
        user_id = payload.user_id or str(current_user["_id"])
        return build_analysis([payload.feedback], user_id, remaining, source_type="manual")[0]
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.post("/analyze-feedback", response_model=FeedbackAnalysisResponse)
def analyze_feedback(
    payload: FeedbackBatchInput,
    current_user: dict = Depends(get_current_user),
):
    if payload.feedback:
        texts = [payload.feedback]
    elif payload.feedbacks:
        texts = payload.feedbacks
    else:
        raise HTTPException(status_code=400, detail="No feedback provided")

    try:
        updated_user = consume_user_credits(current_user, len(texts))
        remaining = int(updated_user.get("credits", 0))
        user_id = payload.user_id or str(current_user["_id"])
        results = build_analysis(texts, user_id, remaining, source_type="manual")
        return {"results": results, "total": len(results), "credits_remaining": remaining}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.post("/upload-csv", response_model=FeedbackAnalysisResponse)
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        df = pd.read_csv(file.file)
        if "feedback" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'feedback' column")

        texts = df["feedback"].dropna().astype(str).tolist()
        updated_user = consume_user_credits(current_user, len(texts))
        remaining = int(updated_user.get("credits", 0))
        batch_id = uuid4().hex
        batch_name = file.filename or f"csv-upload-{batch_id[:8]}.csv"
        results = build_analysis(
            texts,
            str(current_user["_id"]),
            remaining,
            batch_id=batch_id,
            batch_name=batch_name,
            source_type="csv",
        )
        return {"results": results, "total": len(results), "credits_remaining": remaining}
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.get("/feedback-history")
def get_feedback_history(current_user: dict = Depends(get_current_user)):
    try:
        data = list(
            feedback_collection.find(
                {"user_id": str(current_user["_id"])},
                {"_id": 0},
            ).sort("created_at", -1)
        )
        return {"history": jsonable_encoder(data)}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc


@router.get("/download-weekly-report")
def download_weekly_report(format: str = "csv", current_user: dict = Depends(get_current_user)):
    try:
        updated_user = consume_user_credits(current_user, 15)
        last_week = datetime.utcnow() - timedelta(days=7)
        data = list(
            feedback_collection.find(
                {"created_at": {"$gte": last_week}},
                {"_id": 0},
            )
        )

        if not data:
            raise HTTPException(status_code=404, detail="No data available in last 7 days")

        df = pd.DataFrame(data)
        file_path = f"weekly_report.{format}"

        if format == "csv":
            df.to_csv(file_path, index=False)
        elif format == "excel":
            df.to_excel(file_path, index=False)
        elif format == "pdf":
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            content = []

            logo_path = "logo.png"
            if os.path.exists(logo_path):
                content.append(Image(logo_path, width=1.2 * inch, height=1.2 * inch))

            content.append(Paragraph("<b>SENTILYTICS</b>", styles["Title"]))
            content.append(Paragraph("<i>Turn Feedback into Intelligence</i>", styles["Normal"]))
            content.append(Spacer(1, 10))
            content.append(
                Paragraph(
                    f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
                    styles["Normal"],
                )
            )
            content.append(Spacer(1, 20))

            df["created_at"] = pd.to_datetime(df["created_at"])
            df["date"] = df["created_at"].dt.date

            pos = len(df[df["sentiment"] == "Positive"])
            neg = len(df[df["sentiment"] == "Negative"])
            neu = len(df[df["sentiment"] == "Neutral"])
            total = len(df)

            insight = (
                "Customers are generally satisfied. Focus on maintaining quality."
                if pos > neg
                else "High negative feedback detected. Immediate improvements required."
            )

            content.append(Paragraph("<b>AI Executive Summary</b>", styles["Heading2"]))
            content.append(
                Paragraph(
                    f"Total Feedback: {total}<br/>"
                    f"Positive: {pos} | Negative: {neg} | Neutral: {neu}<br/>"
                    f"Insight: {insight}",
                    styles["Normal"],
                )
            )
            content.append(Spacer(1, 20))

            doc.build(content)
        else:
            raise HTTPException(status_code=400, detail="Invalid format")

        return FileResponse(path=file_path, filename=file_path)
    except HTTPException:
        raise
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail=f"Database connection issue: {exc}") from exc
