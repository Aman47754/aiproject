# 👨‍🍳 FlavorAI Bistro: AI-Driven Dynamic Pricing

FlavorAI Bistro is a modern restaurant management platform that leverages **Machine Learning** to dynamically optimize menu pricing based on real-time factors like weather, demand patterns, seasonality, and events.

---

## 🚀 Features

- **AI-Driven Pricing**: Automatically adjusts prices based on a Scikit-learn demand prediction model.
- **Weather-Aware**: Integrates with OpenWeather API to detect local conditions (Hot, Cold, Rain) and suggest items accordingly.
- **Dynamic Demand Prediction**: Analyzes time of day, weekends, and seasonal trends.
- **Owner Dashboard**: Manage your menu items, upload images via Cloudinary, and view AI recommendations.
- **Modern UI**: Sleek, glassmorphism design built with React and Tailwind CSS.
- **Analytics**: Visualization of price distribution, top picks, and demand trends.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Context API.
- **Backend**: Python, Flask, MongoDB Atlas, JWT Authentication.
- **AI/ML**: Scikit-Learn (Random Forest/Gradient Boosting), Pandas, NumPy.
- **Media**: Cloudinary (Image Hosting).

---

## 📥 Installation (Local Development)

### 1. Clone the Repository
```bash
git clone <repository-url>

```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
 venv/Scripts/activate  # Windows
# or: source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

#### Backend Environment Variables (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET_KEY=your_secret_key
PORT=5000

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

#### Frontend Environment Variables (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_BACKEND_URL=http://127.0.0.1:5000
VITE_WEATHER_API_KEY=your_openweathermap_api_key
```

---

## 🏃‍♂️ Running the Application

### Start Backend
```bash
cd backend
python app.py
```
The backend will run on `http://127.0.0.1:5000`.

### Start Frontend
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 📊 ML Model Information
The core pricing engine uses a pre-trained `demand_model.pkl`. It considers:
- `temperature`, `hour`, `is_weekend`, `is_peak_hour`
- `category_enc`, `event_enc`, `season_enc`, `cuisine_type_enc`
- `base_price` vs `final_price` (Price Elasticity)

---

## ☁️ Deployment Ready
- **Frontend**: Pre-configured for **Vercel** (`vercel.json` for SPA routing).
- **Backend**: Pre-configured for **Render** (`Procfile` for Gunicorn).

---

## 📄 License
This project is for demonstration purposes of AI-driven business intelligence.
