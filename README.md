# 🚀 Sentilytics – AI-Powered Feedback Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Machine%20Learning-Enabled-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NLP-Powered-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Flask-green?style=for-the-badge" />
</p>

<p align="center">
  Transform raw feedback into actionable insights using AI, NLP, and real-time analytics.
</p>

---

## ✨ Overview

**Sentilytics** is an intelligent feedback analysis platform that leverages **Machine Learning and Natural Language Processing (NLP)** to automatically analyze user opinions, detect sentiment, and visualize insights.

It helps businesses, educators, and developers **understand feedback at scale** — via text, datasets, or YouTube comments.

---

## 🎯 Key Highlights

- 🧠 AI-driven sentiment classification  
- 📊 Interactive analytics dashboard  
- 🎥 YouTube comment sentiment analysis  
- 💳 Credit-based usage system  
- 📁 Bulk dataset processing  
- ⚡ Scalable architecture  

---

## 🧩 Core Features

### 🔍 Sentiment Analysis Engine
- Classifies feedback into:
  - Positive ✅  
  - Negative ❌  
  - Neutral ⚖️  
- Built using **Scikit-learn**
- Uses **TF-IDF vectorization**

---

### 📊 Analytics Dashboard
- Interactive charts and insights  
- Sentiment distribution visualization  
- Clean and intuitive UI  

---

### 🎥 YouTube URL Analysis *(Advanced Feature)*
- Input any YouTube video URL  
- Automatically extracts comments  
- Performs sentiment analysis  

**Outputs:**
- Sentiment distribution  
- Audience insights  
- Trend patterns  

---

### 💳 Credit System *(System Design Feature)*

| Action | Credits Used |
|--------|------------|
| Single Prediction | 1 Credit |
| Dataset Analysis | Variable |
| YouTube Analysis | Higher Credits |

**Benefits:**
- Prevents misuse  
- Enables scalability  
- Supports future monetization  

---

### 🧾 Multi-Input Support
- ✍️ Manual text input  
- 📁 CSV upload  
- 🎥 YouTube URL  

---

### 🔐 Authentication *(If Enabled)*
- User login/signup  
- Credit tracking  
- Personalized usage  

---

## 🏗️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React.js, Tailwind CSS |
| Backend | Flask (Python) |
| ML/NLP | Scikit-learn, Pandas, NumPy |
| Visualization | Recharts / Matplotlib |
| Database | MongoDB / MySQL |

---

## ⚙️ System Architecture

User Input → Preprocessing → ML Model → Prediction → Visualization → Credit Deduction

---

## 📂 Project Structure
sem_4_project/
│
├── backend/
│ ├── app.py
│ ├── model/
│ ├── utils/
│
├── frontend/
│ ├── components/
│ ├── pages/
│
├── dataset/
├── assets/
│ └── flowchart.png
├── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Tanyagoyal14/sem_4_project.git
cd sem_4_project

cd backend
pip install -r requirements.txt
python app.py

cd frontend
npm install
npm run dev

🔄 How It Works
User provides input (text / dataset / YouTube URL)
Data is cleaned and preprocessed
ML model predicts sentiment
Results are visualized
Credits are deducted

🎥 YouTube Processing Pipeline
URL → Video ID Extraction → Comment Fetching → NLP Processing → Sentiment Output

<p align="center"> <img src="assets/flowchart.png" alt="Sentilytics Flowchart" width="750"> </p> <p align="center"> <i>End-to-end workflow of the Sentilytics feedback analysis pipeline</i> </p>

👨‍💻 Team Members
Ayushi Bansal
Tanya Goyal
Tanisha Tayal


🔮 Future Enhancements
🤖 Transformer models (BERT, LLMs)
📊 Advanced analytics
📱 Mobile responsiveness
🔔 Notification system

📜 License

Developed for academic and learning purposes.

💡 Acknowledgements
Scikit-learn
React.js
Open-source community

📬 Contact
https://github.com/Ayushibansal805
https://github.com/Tanyagoyal14
<p align="center"> ⭐ If you found this project useful, consider giving it a star! </p> ```
