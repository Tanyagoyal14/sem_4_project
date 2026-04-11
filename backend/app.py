from flask import Flask, request, jsonify
from flask_cors import CORS
from mongo_db import collection
from datetime import datetime
from nlp_processor import clean_text, analyze_sentiment

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend running with MongoDB + NLP!"

@app.route("/submit-feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    feedback = data.get("feedback")

    # NLP cleaning
    cleaned = clean_text(feedback)

    # Sentiment analysis
    sentiment, confidence = analyze_sentiment(cleaned)

    doc = {
        "feedback": feedback,
        "cleaned_text": cleaned,
        "sentiment": sentiment,
        "confidence": confidence,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    collection.insert_one(doc)

    return jsonify({
        "message": "Feedback saved with sentiment!",
        "sentiment": sentiment
    })

@app.route("/get-feedback", methods=["GET"])
def get_feedback():
    return jsonify(list(collection.find({}, {"_id": 0})))

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
