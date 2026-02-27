from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from collections import Counter
import re

# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(
    title="Intelligent Customer Feedback AI",
    description="FastAPI backend with NLP + BERT + GenAI + Analytics",
    version="1.0"
)

# ---------------------------------
# AI Models
# ---------------------------------

sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

summary_model = pipeline(
    "text2text-generation",
    model="google/flan-t5-small"
)

# ---------------------------------
# Storage (temporary)
# ---------------------------------

feedback_store = []

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
    return {"status": "AI Backend running with analytics"}

# ---------- Submit Feedback ----------

@app.post("/submit-feedback")
def submit_feedback(request: FeedbackRequest):

    text = request.feedback

    result = sentiment_model(text)[0]

    record = {
        "feedback": text,
        "sentiment": result["label"],
        "confidence": round(result["score"], 3),
        "timestamp": datetime.now().isoformat()
    }

    feedback_store.append(record)

    return record

# ---------- Get Feedback ----------

@app.get("/get-feedback")
def get_feedback():
    return feedback_store

# ---------- Topic Extraction ----------

@app.get("/extract-topics")
def extract_topics(num_topics: int = 3):

    if len(feedback_store) < num_topics:
        return {"message": "Not enough feedback yet"}

    texts = [item["feedback"] for item in feedback_store]

    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(texts)

    kmeans = KMeans(n_clusters=num_topics, random_state=42)
    kmeans.fit(X)

    clusters = {}

    for idx, label in enumerate(kmeans.labels_):
        clusters.setdefault(int(label), []).append(texts[idx])

    return clusters

# ---------- GenAI Summary ----------

@app.get("/generate-summary")
def generate_summary():

    if len(feedback_store) == 0:
        return {"message": "No feedback available"}

    all_text = " ".join([item["feedback"] for item in feedback_store])

    prompt = f"""
Classify the business domain of this customer feedback.

Feedback: {all_text}

Possible domains:
E-commerce, Banking, Healthcare, Education, Food Delivery, Travel, Technology, Telecom, Retail, Other

Domain:
"""



    output = summary_model(prompt, max_length=250, do_sample=False)

    return {"ai_summary": output[0]["generated_text"]}

# ==================================================
# =============== ANALYTICS APIs ===================
# ==================================================

# ---------- Sentiment Stats ----------

@app.get("/sentiment-stats")
def sentiment_stats():

    sentiments = [item["sentiment"] for item in feedback_store]

    count = Counter(sentiments)

    total = len(sentiments)

    if total == 0:
        return {"message": "No data yet"}

    stats = {
        "POSITIVE": round((count.get("POSITIVE", 0) / total) * 100, 2),
        "NEGATIVE": round((count.get("NEGATIVE", 0) / total) * 100, 2),
        "NEUTRAL": round((count.get("NEUTRAL", 0) / total) * 100, 2),
        "total_feedback": total
    }

    return stats

# ---------- Keyword Analysis ----------

@app.get("/common-keywords")
def common_keywords(top_n: int = 10):

    text = " ".join([item["feedback"] for item in feedback_store])

    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())

    stop_words = set([
        "the","and","this","that","with","very","app","is","are","was","were","for","too"
    ])

    words = [w for w in words if w not in stop_words]

    freq = Counter(words).most_common(top_n)

    return {"top_keywords": freq}

# ---------- Sentiment Trend ----------

@app.get("/sentiment-trend")
def sentiment_trend():

    trend = []

    for item in feedback_store:
        trend.append({
            "timestamp": item["timestamp"],
            "sentiment": item["sentiment"]
        })

    return trend
