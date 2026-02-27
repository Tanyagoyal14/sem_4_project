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

    label = result["label"]
    score = round(result["score"], 3)

    return label, score
