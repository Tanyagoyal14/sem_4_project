import re

from transformers import pipeline

# Load sentiment model once so repeated calls stay fast.
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
)

industry_keywords = {
    "E-commerce": ["delivery", "refund", "order", "shipping", "product"],
    "Banking": ["bank", "transaction", "payment", "account", "loan"],
    "Travel": ["flight", "hotel", "booking", "trip", "ticket"],
    "Food": ["restaurant", "food", "taste", "service", "menu"],
    "Technology": ["app", "software", "bug", "crash", "update"],
}


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return text.strip()


def analyze_sentiment(text: str):
    cleaned_text = clean_text(text)
    result = sentiment_model(cleaned_text)[0]
    label = result["label"]
    score = round(result["score"], 3)
    return label, score


def detect_industry(text: str):
    lowered = text.lower()
    scores = {}

    for industry, keywords in industry_keywords.items():
        score = sum(word in lowered for word in keywords)
        if score > 0:
            scores[industry] = score

    if not scores:
        return ["General"]

    sorted_industries = sorted(scores, key=scores.get, reverse=True)
    return sorted_industries[:3]
