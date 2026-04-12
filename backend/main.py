from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import pipeline
from datetime import datetime
from typing import Optional, List

from langdetect import detect
from deep_translator import GoogleTranslator

import pandas as pd
import os
import matplotlib.pyplot as plt

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Image
from reportlab.lib.units import inch
# -----------------------------
# APP SETUP
# -----------------------------

app = FastAPI(title="AI Feedback Intelligence System", version="8.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔥 UPDATED MAIN.PY LOADED 🔥")

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


def get_sentiment(label):
    if label == "LABEL_0":
        return "Negative"
    elif label == "LABEL_1":
        return "Neutral"
    return "Positive"

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

    if request.feedback:
        texts = [request.feedback]
    elif request.feedbacks:
        texts = request.feedbacks
    else:
        return {"error": "No feedback provided"}

    translated = [translate(t) for t in texts]

    sentiments = sentiment_model(translated, batch_size=8)

    industry_results = classifier(translated, candidate_labels=INDUSTRIES, batch_size=4)
    type_results = classifier(translated, candidate_labels=FEEDBACK_TYPES, batch_size=8)

    results = []

    for i, text in enumerate(texts):

        sentiment = get_sentiment(sentiments[i]["label"])

        top_industries = [
            {"industry": l, "confidence": round(s, 3)}
            for l, s in zip(
                industry_results[i]["labels"],
                industry_results[i]["scores"]
            )
        ][:3]

        feedback_type = type_results[i]["labels"][0]

        csat = 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30

        feedback_history.append({
            "feedback": translated[i],
            "sentiment": sentiment,
            "type": feedback_type,
            "timestamp": datetime.now().isoformat()
        })

        results.append({
            "feedback": text,
            "translated": translated[i],
            "sentiment": sentiment,
            "feedback_type": feedback_type,
            "top_industries": top_industries,
            "csat_score": csat
        })

    return {"results": results}

# -----------------------------
# CSV UPLOAD (FAST)
# -----------------------------

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)

    if "feedback" not in df.columns:
        return {"error": "CSV must contain 'feedback' column"}

    texts = df["feedback"].dropna().astype(str).tolist()

    translated = [translate(t) for t in texts]

    sentiments = sentiment_model(translated, batch_size=16)
    industry_results = classifier(translated, candidate_labels=INDUSTRIES, batch_size=8)
    type_results = classifier(translated, candidate_labels=FEEDBACK_TYPES, batch_size=16)

    results = []

    for i, text in enumerate(texts):

        sentiment = get_sentiment(sentiments[i]["label"])

        feedback_type = type_results[i]["labels"][0]

        results.append({
            "feedback": text,
            "translated": translated[i],
            "sentiment": sentiment,
            "feedback_type": feedback_type,
            "top_industries": [],
            "csat_score": 100 if sentiment == "Positive" else 50 if sentiment == "Neutral" else 30
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

    # ---------------- CSV ----------------
    if format == "csv":
        file_path = "report.csv"
        df.to_csv(file_path, index=False)

    # ---------------- EXCEL ----------------
    elif format == "excel":
        file_path = "report.xlsx"
        df.to_excel(file_path, index=False)

    # ---------------- PDF (🔥 PREMIUM) ----------------
    
    elif format == "pdf":

        file_path = "report.pdf"

        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()

        content = []

        # -----------------------------
        # HEADER (LOGO + BRAND)
        # -----------------------------
        logo_path = "logo.png"

        if os.path.exists(logo_path):
            content.append(Image(logo_path, width=1.2*inch, height=1.2*inch))

        content.append(Paragraph("<b>SENTILYTICS</b>", styles["Title"]))
        content.append(Paragraph("<i>Turn Feedback into Intelligence</i>", styles["Normal"]))
        content.append(Spacer(1, 10))

        content.append(Paragraph(
            f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            styles["Normal"]
        ))
        content.append(Spacer(1, 20))

        # -----------------------------
        # DATA PREP
        # -----------------------------
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["date"] = df["timestamp"].dt.date

        pos = len(df[df["sentiment"] == "Positive"])
        neg = len(df[df["sentiment"] == "Negative"])
        neu = len(df[df["sentiment"] == "Neutral"])
        total = len(df)

        # -----------------------------
        # AI SUMMARY
        # -----------------------------
        if pos > neg:
            insight = "Customers are generally satisfied. Focus on maintaining quality."
        else:
            insight = "High negative feedback detected. Immediate improvements required."

        summary = f"""
        Total Feedback: {total}<br/>
        Positive: {pos} | Negative: {neg} | Neutral: {neu}<br/>
        Insight: {insight}
        """

        content.append(Paragraph("<b>AI Executive Summary</b>", styles["Heading2"]))
        content.append(Paragraph(summary, styles["Normal"]))
        content.append(Spacer(1, 20))

        # -----------------------------
        # 📊 SENTIMENT BAR CHART
        # -----------------------------
        plt.figure()
        plt.bar(["Positive", "Negative", "Neutral"], [pos, neg, neu])
        plt.title("Sentiment Distribution")

        bar_chart = "bar_chart.png"
        plt.savefig(bar_chart)
        plt.close()

        content.append(Paragraph("<b>Sentiment Distribution</b>", styles["Heading2"]))
        content.append(Image(bar_chart, width=400, height=250))
        content.append(Spacer(1, 20))

        # -----------------------------
        # 📈 WEEKLY TREND
        # -----------------------------
        trend = df.groupby(["date", "sentiment"]).size().unstack(fill_value=0)

        plt.figure()
        for col in trend.columns:
            plt.plot(trend.index, trend[col], label=col)

        plt.legend()
        plt.title("Weekly Sentiment Trend")

        line_chart = "line_chart.png"
        plt.savefig(line_chart)
        plt.close()

        content.append(Paragraph("<b>Weekly Trend Analysis</b>", styles["Heading2"]))
        content.append(Image(line_chart, width=400, height=250))
        content.append(Spacer(1, 20))

        # -----------------------------
        # GROUPED FEEDBACK
        # -----------------------------
        def add_section(title, data, color):
            content.append(Paragraph(f"<b>{title}</b>", styles["Heading2"]))
            content.append(Spacer(1, 10))

            for row in data[:10]:
                text = f"<font color='{color}'>{row['feedback']}</font>"
                content.append(Paragraph(text, styles["Normal"]))
                content.append(Spacer(1, 5))

            content.append(Spacer(1, 15))

        add_section("Positive Feedback", df[df["sentiment"] == "Positive"].to_dict("records"), "green")
        add_section("Neutral Feedback", df[df["sentiment"] == "Neutral"].to_dict("records"), "orange")
        add_section("Negative Feedback", df[df["sentiment"] == "Negative"].to_dict("records"), "red")

        # -----------------------------
        # BUILD PDF
        # -----------------------------
        doc.build(content)

        # -----------------------------
        # CLEANUP
        # -----------------------------
        for f in [bar_chart, line_chart]:
            if os.path.exists(f):
                os.remove(f)

        # -----------------------------
        # RETURN FILE
        # -----------------------------
        return FileResponse(
            path=file_path,
            filename="Sentilytics_Report.pdf",
            media_type="application/pdf"
        )