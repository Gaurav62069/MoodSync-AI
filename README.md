# 🧠 MoodSync AI: The AI-Powered Wellness Coach

MoodSync AI is an advanced web and mobile application designed to intelligently sense your mood, both passively (via phone sensors) and actively (through text, voice, and facial analysis). It leverages AI to provide personalized content suggestions (like movies, songs, and tasks) to proactively improve your mental wellness.

---

## ✨ Features

### 1. 🔑 Authentication & User
* **Local Auth:** Standard Email + Password registration and login.
* **Email Verification:** Confirmation link sent to user's email upon registration.
* **Password Reset:** Secure "Forgot Password" system.
* **Google OAuth:** One-click "Login with Google" integration.
* **Profile Management:** Users can update their profile (username, photo, password) and delete their account.

### 2. 🤖 AI Mood Sensing (Core)
* **Text Analysis:** Detects mood from user's text input (`sentiment` library).
* **AI Chatbot:** Understands user's mood through natural conversation (`Groq/LLaMA 3.1`).
* **Voice Tone Analysis:** Analyzes the pitch, energy, and tone of the user's voice to detect emotion (Python + `librosa`).
* **Face Analysis:** Scans the user's facial expressions via webcam to detect mood (Frontend: `face-api.js`).
* **AI Sleep Analysis:** Predicts user's sleep quality (Poor, Good) using phone sensors (Python + `scikit-learn`).

### 3. 💡 Personalized Suggestions (10+ Types)
* **Movies:** Mood-based recommendations (TMDB API).
* **Songs:** Mood-based recommendations (Spotify API).
* **Podcasts:** Mood-based recommendations (Spotify API).
* **News:** "Good News" or specific topics (NewsAPI).
* **Short Videos:** Funny or wholesome shorts (YouTube API).
* **Books:** Self-help or fiction (Google Books API).
* **Actionable Tasks:** Real-world tasks like "5-min walk" or "Deep breathing".
* **Jokes:** Mood-lifting jokes (JokeAPI).

### 4. 🔮 Advanced AI & Gamification
* **AI Mood Forecasting:** Predicts the user's next-day mood based on the last 7 days of data (mood, sleep) (Python + `scikit-learn`).
* **Weekly AI Summary:** Generates a personalized weekly wellness report for the user using Google Gemini AI.
* **Gamification:** Awards Points, Badges, and Streaks for consistent mood logging.
* **Context-Aware Notifications:** Sends proactive push notifications based on user activity (e.g., arriving at the 'gym') using Firebase FCM.

### 5. 📊 Data & History
* **Journaling:** A private, secure diary for the user (Full CRUD).
* **Mood History:** A complete, paginated history of all logged moods.
* **Activity History:** Logs all content (movies, songs) the user has interacted with.

---

## 💻 Tech Stack

This project utilizes a **Polyglot Monorepo** architecture.

* **Backend API:** **Node.js + Express.js**
* **Database:** **MongoDB** (MERN Stack)
* **AI/ML Server:** **Python + Flask**
* **AI Models:** `scikit-learn`, `librosa`, `pydub`, `Groq (LLaMA)`
* **Scheduling:** `node-cron` (For Reports and Forecasting)
* **Push Notifications:** `firebase-admin` (FCM)
* **Audio Handling:** `FFmpeg`, `multer`

---

## 📁 Project Structure

```
moodsync-project/
├── project-backend/     (Node.js / Express.js Server)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env             (Ignored)
│   └── server.js
├── project-python-ai/   (Python / Flask AI Server)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── controllers.py
│   │   ├── routes.py
│   │   ├── services.py
│   │   └── utils.py
│   ├── venv/            (Ignored)
│   ├── uploads/         (Ignored)
│   ├── *.pkl            (Trained Models)
│   └── run.py
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Backend Server (Node.js)

1.  **Navigate to folder:** `cd project-backend`
2.  **Install dependencies:** `npm install`
3.  **Create `.env` file:** Create a `.env` file in the `project-backend` folder and add all API keys (MongoDB, JWT, Google OAuth, Spotify, TMDB, NewsAPI, YouTube, Groq, Firebase).
4.  **Start server:** `npm run dev`
5.  Server will run on `http://localhost:5000`.

### 2. AI Server (Python)

1.  **Navigate to folder:** `cd project-python-ai`
2.  **Create virtual environment:** `python -m venv venv`
3.  **Activate environment:** `.\venv\Scripts\activate` (Windows)
4.  **Install dependencies:** `pip install -r requirements.txt`
    *(You may need to create this file first: `pip freeze > requirements.txt`)*
5.  **Install FFmpeg:** FFmpeg is required for audio analysis. Download it and add it to your system's PATH.
6.  **Train Dummy Models:**
    * `python train_model.py`
    * `python train_forecast_model.py`
    * `python train_voice_model.py`
7.  **Start server:** `python run.py`
8.  Server will run on `http://localhost:5001`.