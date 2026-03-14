# 🤖 AI Feedback Intelligence System

Transform raw customer feedback into **actionable business insights** using **Artificial Intelligence, Natural Language Processing, and Interactive Dashboards**.

This platform automatically analyzes feedback, detects sentiment, identifies industries, classifies complaints, and visualizes insights through a modern **AI analytics dashboard**.

---

# 🚀 Project Overview

Businesses receive thousands of customer feedback messages from reviews, surveys, and support systems.

Manually analyzing this feedback is:

❌ time consuming
❌ inefficient
❌ prone to missing insights

Our system solves this problem by using **AI models to analyze feedback automatically** and convert it into **visual business intelligence**.

---

# 🎯 Key Features

### 🔍 AI Feedback Analysis

The system automatically detects:

* Sentiment (Positive / Negative)
* Industry related to feedback
* Feedback type (Complaint, Suggestion, Praise, Question)

---

### 🌐 Hinglish Support

The system supports **mixed Hindi-English feedback**.

Example:

```id="t7wzld"
Input:
"ye app bahut slow hai"

Translated:
"This app is very slow"
```

The translated text is then analyzed by AI models.

---

### 📊 AI Analytics Dashboard

The React dashboard visualizes insights using:

* Sentiment distribution charts
* Industry prediction graphs
* Complaint classification
* CSAT (Customer Satisfaction Score)
* Live feedback stream

---

### 📈 Analytics Panel

Provides deeper insights such as:

* Sentiment trends
* Complaint statistics
* Feedback analytics
* AI generated insights

---

### 🧠 AI Recommendation Engine

Based on feedback analysis, the system suggests improvements.

Example:

```id="l5dmyd"
Industry: Food Delivery

Recommendation:
Improve delivery tracking and reduce delays.
```

---

### 🗂 Feedback History

Stores all analyzed feedback including:

| Field         | Description                |
| ------------- | -------------------------- |
| Feedback Text | Original customer feedback |
| Sentiment     | Positive or Negative       |
| Industry      | Predicted industry         |
| Feedback Type | Complaint / Suggestion     |
| Timestamp     | Analysis time              |

---

### 📄 Report Generation

Export feedback insights as:

* 📄 PDF reports
* 📊 Excel files
* 📑 CSV datasets

---

# 🧩 System Workflow

```id="9q8zqg"
User Feedback
      ↓
Frontend Dashboard (React)
      ↓
FastAPI Backend
      ↓
Language Detection
      ↓
Translation (if Hinglish)
      ↓
Sentiment Analysis
      ↓
Industry Classification
      ↓
Complaint Detection
      ↓
CSAT Score Calculation
      ↓
AI Recommendations
      ↓
Dashboard Visualization
```

---

# 🧠 AI Models Used

### Sentiment Analysis

```id="x19i4j"
distilbert-base-uncased-finetuned-sst-2-english
```

Detects whether feedback is **positive or negative**.

---

### Industry Classification

```id="v3kmic"
facebook/bart-large-mnli
```

Uses **zero-shot classification** to predict which industry the feedback belongs to.

Example industries:

* E-commerce
* Banking
* Healthcare
* Education
* Food Delivery
* Technology
* Telecom
* Retail
* Travel

---

### Complaint Detection

Also uses **BART MNLI** to classify feedback into:

* Complaint
* Suggestion
* Praise
* Question

---

# 📊 Example Analysis

Input Feedback:

```id="vvy98s"
"The delivery was late and the app crashed during payment."
```

AI Output:

```id="mjv9np"
Sentiment: Negative
Industry: Food Delivery
Feedback Type: Complaint
CSAT Score: 72%
```

Recommendation:

```id="ui13qi"
Improve delivery tracking and payment reliability
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* TailwindCSS
* Recharts (data visualization)
* React Router

---

## Backend

* FastAPI
* Python

---

## AI / NLP

* HuggingFace Transformers
* DistilBERT (Sentiment Analysis)
* BART MNLI (Zero-Shot Classification)

---

## Translation

* Deep Translator
* Google Translate API

---

## Data Processing

* Pandas
* NumPy

---

## Report Generation

* ReportLab
* OpenPyXL



# 📂 Project Structure

```id="ysgbto"
backend
│
├── main.py
├── requirements.txt
│
frontend
│
├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── styles
│   └── App.tsx
```



# ⚙ Installation

### 1️⃣ Clone Repository

```id="jz00v8"
git clone https://github.com/yourusername/ai-feedback-intelligence.git
```



### 2️⃣ Install Backend Dependencies

```id="ym2csi"
pip install -r requirements.txt
```



### 3️⃣ Run Backend Server

```id="4gyrqi"
uvicorn main:app --port 8002 --reload
```



### 4️⃣ Install Frontend Dependencies

```id="mq2s34"
cd frontend
npm install
```



### 5️⃣ Start Frontend

```id="8pbo2f"
npm run dev
```



# 👥 Target Audience

This platform can be used by:

* 🛒 E-commerce companies
* 🍔 Food delivery platforms
* 🏦 Banking and fintech companies
* 📞 Telecom services
* 💻 SaaS companies
* 📊 Customer support teams

Any organization that receives **large volumes of customer feedback** can benefit from this system.



# ✅ Advantages

✔ Automated feedback analysis
✔ Real-time sentiment detection
✔ Hinglish feedback support
✔ AI-powered insights
✔ Interactive analytics dashboard
✔ Exportable business reports



# 🔮 Future Scope

Possible improvements include:

* Topic clustering of feedback
* Predictive customer satisfaction analysis
* Social media review integration
* Multilingual support
* Real-time complaint alert system
* AI-generated feedback summaries


# 💡 Project Goal

The goal of this system is to demonstrate how **Artificial Intelligence and Natural Language Processing can transform unstructured customer feedback into meaningful business intelligence.**
