from transformers import pipeline


# load sentiment model
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)


# simple keyword-based industry detection
industry_keywords = {
    "E-commerce": ["delivery", "refund", "order", "shipping", "product"],
    "Banking": ["bank", "transaction", "payment", "account", "loan"],
    "Travel": ["flight", "hotel", "booking", "trip", "ticket"],
    "Food": ["restaurant", "food", "taste", "service", "menu"],
    "Technology": ["app", "software", "bug", "crash", "update"]
}


def analyze_sentiment(text: str):

    result = sentiment_model(text)[0]

    label = result["label"]
    score = float(result["score"])

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