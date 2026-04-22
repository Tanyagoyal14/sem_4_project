# 🚀 Sentilytics

### Turn Feedback into Intelligence

Sentilytics is an AI-powered feedback intelligence platform that transforms raw customer feedback into actionable business insights using **Natural Language Processing, Machine Learning, and Interactive Dashboards**.

---

# 🧠 Project Overview

Businesses receive thousands of feedback messages from users across reviews, surveys, and support systems.

Manually analyzing this feedback is:

❌ Time-consuming
❌ Inefficient
❌ Error-prone

Sentilytics automates this process using AI to extract meaningful insights and visualize them in a modern dashboard.

---

# ✨ Key Features

## 🔍 AI Feedback Analysis

Automatically detects:

* Sentiment (Positive / Neutral / Negative)
* Industry classification
* Feedback type (Complaint, Suggestion, Praise, Question)
* CSAT score

---

## 📂 CSV Upload & Bulk Processing

* Upload CSV files with multiple feedback entries
* Supports batch processing for faster analysis ⚡
* Optimized using transformer batch inference

Example CSV format:

```
feedback
Product acha hai
App crash ho gaya
Loved the experience
```

---

## 🌐 Hinglish Support

Supports mixed Hindi-English feedback.

Example:

```
Input:
"ye app bahut slow hai"

Translated:
"This app is very slow"
```

---

## 📊 AI Analytics Dashboard

Interactive dashboard built with React:

* Sentiment distribution
* Industry insights
* CSAT score tracking
* Live feedback stream
* AI-powered recommendations

---

## 🧠 AI Recommendation Engine

Generates actionable insights:

```
Industry: Food Delivery  
Recommendation: Improve delivery tracking and reduce delays  
```

---

## 🗂 Feedback History

Stores analyzed feedback with:

| Field     | Description              |
| --------- | ------------------------ |
| Feedback  | Original input           |
| Sentiment | AI prediction            |
| Industry  | Top predicted industries |
| Type      | Complaint / Suggestion   |
| Timestamp | Processing time          |

---

## 📄 Report Generation

Export insights as:

* CSV
* Excel
* PDF

---

# 🔄 System Flowchart

<p align="center">
  <img src="./assets/flowchart.png" width="750"/>
</p>

<p align="center"><i>End-to-end AI feedback processing pipeline</i></p>

# 🧠 AI Models Used

## Sentiment Analysis

```
cardiffnlp/twitter-roberta-base-sentiment
```

* Detects Positive / Neutral / Negative sentiment

---

## Zero-Shot Classification

```
facebook/bart-large-mnli
```

Used for:

* Industry classification
* Feedback type detection

---

# 📊 Example Analysis

### Input

```
The delivery was late and the app crashed during payment.
```

### Output

```
Sentiment: Negative  
Industry: Food Delivery  
Feedback Type: Complaint  
CSAT Score: 30%  
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* TailwindCSS
* Framer Motion
* Recharts

## Backend

* FastAPI
* Python

## AI / NLP

* HuggingFace Transformers
* RoBERTa (Sentiment Analysis)
* BART MNLI (Classification)

## Translation

* Deep Translator
* Langdetect

## Data Processing

* Pandas
* NumPy

## Reports

* ReportLab
* OpenPyXL

---

# 📂 Project Structure

```
backend/
│
├── main.py
├── requirements.txt
│
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── styles/
│   └── App.tsx
```

---

## 🛠️ Setup Instructions

Follow these steps to get **Sentilytics** up and running on your local machine.

---

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/yourusername/sentilytics.git
cd sentilytics
```

---

### 2. ⚙️ Backend Setup (FastAPI)

The backend handles data processing and logic.

#### 📂 Navigate to backend

```bash
cd backend
```

#### 📦 Install dependencies

```bash
pip install -r requirements.txt
```

#### ▶️ Run the server

```bash
uvicorn main:app --reload --port 8002
```

---

### 3. 🎨 Frontend Setup (React)

Open a new terminal (keep backend running).

#### 📂 Navigate to frontend

```bash
cd frontend
```

#### 📦 Install libraries

```bash
npm install recharts framer-motion react-countup lottie-react d3
```

#### ▶️ Start development server

```bash
npm run dev
```

---

## 📄 Input CSV Format

To use **Sentilytics**, upload a CSV file containing user feedback.

---

### ✅ Required Column

* **`feedback` (case-insensitive)**
  Contains user comments (complaints, suggestions, praise)

✔ Accepted formats:

* `feedback`
* `Feedback`
* `FEEDBACK`
* `feedBack`

---

### ⚠️ Validation Rules

* 📁 **Format:** Must be a valid CSV file
* 📌 **Column Required:** Must include a `feedback` column
* ✍️ **Content:** Column must not be empty
* ❌ **Error Handling:** Missing column → validation error

---


# 🎯 Target Audience

* E-commerce platforms 🛒
* Food delivery apps 🍔
* Banking & fintech 🏦
* Telecom services 📞
* SaaS companies 💻
* Customer support teams 📊
* surveys files also

---

# ⚡ Performance Optimization

Sentilytics uses:

* Batch inference for transformers ⚡
* Optimized pipeline execution
* Faster bulk feedback processing
* Reduced latency for CSV uploads

---

# ✅ Advantages

✔ Automated feedback intelligence
✔ Hinglish support 🇮🇳
✔ Bulk + CSV processing
✔ Real-time analytics dashboard
✔ AI-driven recommendations
✔ Exportable reports

---

# 🔮 Future Scope

* Topic clustering
* Real-time alerts
* Multilingual expansion
* Social media integration
* AI summarization of feedback
* Predictive CSAT trends

---

# 👩‍💻 Team

* Ayushi Bansal
* Tanya Goyal
* Tanisha Tayal

---

# 💡 Project Goal

To demonstrate how **AI + NLP can convert unstructured customer feedback into actionable business intelligence at scale**.
