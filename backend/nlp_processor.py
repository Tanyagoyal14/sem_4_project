<<<<<<< HEAD:sem_4_project/backend/nlp_processor.py
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from transformers import pipeline

# Load sentiment model (pre-trained)
sentiment_model = pipeline("sentiment-analysis")

stop_words = set(stopwords.words("english"))

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z\s]", "", text)

    words = word_tokenize(text)

    words = [w for w in words if w not in stop_words]

    return " ".join(words)

def analyze_sentiment(text):
    result = sentiment_model(text)[0]
=======
    from transformers import pipeline
import re

# Load sentiment model once
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# Industry keyword mapping
industry_keywords = {
    "E-commerce": ["delivery", "refund", "order", "shipping", "product"],
    "Banking": ["bank", "transaction", "payment", "account", "loan"],
    "Travel": ["flight", "hotel", "booking", "trip", "ticket"],
    "Food": ["restaurant", "food", "taste", "service", "menu"],
    "Technology": ["app", "software", "bug", "crash", "update"]
}

def clean_text(text: str):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return text.strip()

def analyze_sentiment(text: str):
    cleaned_text = clean_text(text)
    result = sentiment_model(cleaned_text)[0]
>>>>>>> 7a4a6ffb626ba14e532c41f5a4e688efc5f12bea:backend/nlp_processor.py

    label = result["label"]
    score = round(result["score"], 3)

<<<<<<< HEAD:sem_4_project/backend/nlp_processor.py
    return label, score
=======
    return label, score

def detect_industry(text: str):
    text = text.lower()
    scores = {}

    for industry, keywords in industry_keywords.items():
        score = sum(word in text for word in keywords)
        if score > 0:
            scores[industry] = score

    if not scores:
        return ["General"]

    sorted_industries = sorted(scores, key=scores.get, reverse=True)
    return sorted_industries[:3]
>>>>>>> 7a4a6ffb626ba14e532c41f5a4e688efc5f12bea:backend/nlp_processor.py
