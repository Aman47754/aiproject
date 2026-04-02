# AI-Driven Dynamic Pricing for Restaurants: Architecture & Workflow

This document outlines the Data Entity-Relationship Model and the Application Workflow for the AI-Driven Pricing project.

## 1. Entity-Relationship (ER) Diagram

The backend relies on MongoDB (Atlas) under the database `flavor_ai`. The ER diagram below shows the primary collections used in the application.

> [!NOTE] 
> Since MongoDB is a NoSQL database, the "ER diagram" primarily represents the schema of documents stored within collections instead of strict relational tables.

```mermaid
erDiagram
    DATABASE ||--o{ MENU_COLLECTION : contains
    DATABASE ||--o{ OWNER_MENU_TABLE : contains

    MENU_COLLECTION {
        ObjectId _id PK
        String name "Dish Name"
        Float base_price
        String category "beverage, fast_food, snack, main_course"
        String cuisine_type "indian, continental, italian, chinese, american"
    }

    OWNER_MENU_TABLE {
        ObjectId _id PK
        DateTime timestamp
        Object scenario "Scenario configuration details"
        Array recommendations "Array of top recommended items"
        Array all_predictions "Array of all menu items processed"
    }
    
    SCENARIO_OBJECT {
        Float temperature
        Int hour
        Int is_weekend "1 or 0"
        Int is_peak_hour "1 or 0"
        String event "none, festival, promotion"
        String season "summer, winter, monsoon"
    }
    
    PREDICTION_OBJECT {
        String name
        Float base_price
        String category
        String cuisine_type
        Float optimal_price "Suggested AI Price"
        Float predicted_demand
        Float expected_revenue
        Float confidence
    }
    
    OWNER_MENU_TABLE ||--o| SCENARIO_OBJECT : "Contains"
    OWNER_MENU_TABLE ||--o{ PREDICTION_OBJECT : "Contains (recommendations, all_predictions)"
```

## 2. System Workflow

The following is the high-level system workflow encompassing how a restaurant owner interacts with the system to generate AI-driven dynamic prices.

### Core User Journey

1. **Dashboard Initialization:** Owner opens the `OwnerDashboard` via the Frontend (React). 
2. **Weather Synchronization:** The app fetches the current real-time weather and temperature using the device location and OpenWeather API.
3. **Menu Management:** Owner manages their current list of menu items and base prices.
4. **Trigger AI Analysis:** Owner clicks "Get AI recommendations".
5. **Backend Processing & AI:** Data is sent to the Flask Backend. The Machine Learning prediction model (`demand_model.pkl`) processes different price points in the current scenario (weather + time of day + season) to find the price that maximizes expected revenue.
6. **Data Storage:** Predictions are securely saved to MongoDB Atlas for persistence and historical tracking.
7. **Frontend Presentation:** Final data returns, presenting the owner with full analytics, expected changes in demand, and revenue optimizations.

### Workflow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Owner
    participant Frontend (React)
    participant Weather API (OpenWeather)
    participant Backend (Flask)
    participant ML Model
    participant Database (MongoDB Atlas)

    Note over Owner, Frontend (React): Step 1: Menu Preparation
    Owner->>Frontend (React): Opens Owner Dashboard
    Frontend (React)->>Weather API (OpenWeather): Fetch current geolocation & weather
    Weather API (OpenWeather)-->>Frontend (React): Return Temperature, Condition, City
    Owner->>Frontend (React): Adds/Edits Custom Menu Items (name, base price, categories)
    
    Note over Owner, Frontend (React): Step 2: Request Prediction
    Owner->>Frontend (React): Clicks "Get AI Recommendations"
    Frontend (React)->>Backend (Flask): POST /custom-menu (custom items + environmental scenario)
    
    Note over Backend (Flask), Database (MongoDB Atlas): Step 3: AI Price Optimization
    loop For Each Menu Item
        Backend (Flask)->>Backend (Flask): Prepare feature array (temp, hour, category encoders)
        loop Test Prices (80% to 120% of base price)
            Backend (Flask)->>ML Model: Predict demand at Current Test Price
            ML Model-->>Backend (Flask): Predicted Demand
            Backend (Flask)->>Backend (Flask): Calculate Revenue (Price * Demand)
            Backend (Flask)->>Backend (Flask): Track max revenue & best price
        end
    end
    
    Backend (Flask)->>Backend (Flask): Sort & identify top recommendations
    Backend (Flask)->>Database (MongoDB Atlas): Insert Prediction Record into `owner_menu_table`
    Database (MongoDB Atlas)-->>Backend (Flask): Success Acknowledgement
    
    Note over Frontend (React), Backend (Flask): Step 4: Display Results
    Backend (Flask)-->>Frontend (React): Return Top Recommendations & All Scenarios Output
    Frontend (React)-->>Owner: Render Optimal Prices, Demand Gauges, Revenue Projections
```

## Summary of Storage

- **`menu` Collection:** Acts as a generic or main menu repository for the restaurant. Handled by endpoints like `/add-item`, `/get-menu`, `/update-item`, etc.
- **`owner_menu_table` Collection:** Stores historical AI-prediction tasks that the owner creates dynamically through the dashboard (from `/custom-menu`). Useful for creating tracking modules or historical revenue comparison views in the future.
