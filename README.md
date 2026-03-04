# 🚀 Intelligent Customer Feedback Analysis System

An AI-powered backend system that analyzes customer feedback using NLP and Transformer models.

This project performs:

* ✅ Sentiment Analysis (BERT)
* ✅ Multi-label Industry Classification (Zero-Shot BART MNLI)
* ✅ Confidence Scoring
* ✅ Industry-Specific Recommendation Engine
* ✅ REST API with FastAPI

---

# 🧠 Project Overview

This system transforms raw customer feedback into structured intelligence by:

1. Detecting customer sentiment
2. Identifying the relevant business industry
3. Providing confidence scores
4. Generating tailored improvement recommendations

The backend is built using FastAPI and Transformer-based NLP models.

---

# 🏗 Architecture

User Feedback → Sentiment Analysis (BERT) → Zero-Shot Industry Classification (BART) → Recommendation Engine → JSON API Response

---

# 📦 Tech Stack

* FastAPI
* Uvicorn
* Transformers (HuggingFace)
* PyTorch
* Pydantic
* Scikit-learn

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone <your-repo-link>
cd <project-folder>
```

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

## 3️⃣ Run Server

```bash
uvicorn main:app --port 8002
```

Open Swagger UI:

[http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs)

---

# 📡 API Endpoints

## GET /

Health check endpoint

---

## POST /analyze-feedback

Analyzes feedback for:

* Sentiment
* Multi-label industry prediction
* Confidence scores
* Industry-specific recommendations

### Example Request

```json
{
  "feedback": "The app crashes during payment and delivery tracking is inaccurate"
}
```

### Example Response

```json
{
  "sentiment": "NEGATIVE",
  "sentiment_confidence": 0.982,
  "top_industries": [
    {"industry": "Food Delivery", "confidence": 0.82},
    {"industry": "E-commerce", "confidence": 0.76}
  ],
  "recommendations": [
    {
      "industry": "Food Delivery",
      "recommendation": "Improve delivery time accuracy and tracking reliability."
    }
  ]
}
```

---

## POST /industry-confidence

Returns confidence distribution across all industries.

---

# 🎯 Key Features

* Transformer-based sentiment detection
* Zero-shot multi-label classification
* Confidence threshold filtering
* Structured JSON outputs
* Easily extendable architecture

---

# 📈 Future Improvements

* Database integration (MongoDB/PostgreSQL)
* Frontend dashboard (React / Next.js)
* Visualization charts (Bar / Pie / Radar)
* Explainable AI (SHAP)
* Fine-tuned domain-specific models

---

# 🎓 Academic Value

This project demonstrates:

* Real-time NLP processing
* Transformer-based AI systems
* Zero-shot learning
* API-based AI deployment


# 👩‍💻 Author

Developed as part of an advanced AI feedback intelligence system project.

---

# 📜 License

This project is open-source for educational purposes.
