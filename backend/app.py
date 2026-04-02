from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
from pymongo import MongoClient
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["flavor_ai"]        # database name
menu_collection = db["menu"]   # collection name
owner_menu_data = db["owner menu"]
owner_menu_table = db["owner_menu_table"]

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------- LOAD MODEL -----------
feature_cols = pickle.load(open('feature_cols.pkl', 'rb'))
model = pickle.load(open('demand_model.pkl', 'rb'))


# ---------------- CATEGORICAL ENCODINGS ----------------
category_mapping = {"beverage": 0, "fast_food": 1, "main_course": 2, "snack": 3}
event_mapping = {"none": 0, "festival": 1, "promotion": 2}
season_mapping = {"summer": 0, "monsoon": 1, "winter": 2}
cuisine_mapping = {"continental": 0, "italian": 1, "indian": 2, "chinese": 3, "american": 4}

# ---------------- MENU DATA (fetching from db)----------------
def get_menu_from_db():
    items = list(menu_collection.find({}, {"_id": 0}))
    return items

# --------------OWNER RESTAURANT MENU ---------------
@app.route('/add-item', methods=['POST'])
def add_item():
    data = request.json

    menu_collection.insert_one(data)

    return jsonify({"message": "Item added successfully"})

@app.route('/get-menu', methods=['GET'])
def get_menu_items():
    items = list(menu_collection.find({}, {"_id": 0}))
    return jsonify(items)

@app.route('/update-item', methods=['PUT'])
def update_item():
    data = request.json

    menu_collection.update_one(
        {"name": data["name"]},
        {"$set": data}
    )

    return jsonify({"message": "Item updated"})

@app.route('/delete-item', methods=['DELETE'])
def delete_item():
    data = request.json

    menu_collection.delete_one({"name": data["name"]})

    return jsonify({"message": "Item deleted"})
# ---------------- PRICE OPTIMIZATION ----------------
def find_optimal_price(model, base_features, base_price):
    best_price = base_price
    max_revenue = 0

    for price in np.arange(base_price * 0.8, base_price * 1.2 + 1, 5):
        temp_features = base_features.copy()

        temp_features['final_price'] = price
        temp_features['price_diff'] = price - base_price

        df = pd.DataFrame([temp_features])
        demand = model.predict(df)[0]

        revenue = demand * price

        if revenue > max_revenue:
            max_revenue = revenue
            best_price = price

    return best_price, max_revenue

# ---------------- HELPER: process items for a scenario ----------------
def process_menu_for_scenario(items, scenario, top_n=10, min_demand_threshold=1):
    temp = scenario.get("temperature", 30)
    hour = scenario.get("hour", 14)
    is_weekend = scenario.get("is_weekend", 0)
    is_peak_hour = scenario.get("is_peak_hour", 1)
    event = scenario.get("event", "none")
    season = scenario.get("season", "summer")

    results = []

    
    for item in items:
        
        input_data = {col: 0 for col in feature_cols}

        
        input_data['temperature'] = temp
        input_data['hour'] = hour
        input_data['is_weekend'] = is_weekend
        input_data['is_peak_hour'] = is_peak_hour

        input_data['base_price'] = item["base_price"]
        input_data['final_price'] = item["base_price"]

        #  Encodings
        input_data['category_enc'] = category_mapping.get(item.get("category", "snack"), 0)
        input_data['event_enc'] = event_mapping.get(event, 0)
        input_data['season_enc'] = season_mapping.get(season, 0)
        input_data['cuisine_type_enc'] = cuisine_mapping.get(item.get("cuisine_type", "continental"), 0)

        # Price optimization
        best_price, revenue = find_optimal_price(model, input_data.copy(), item["base_price"])

        #  Predict demand at best price
        input_data['final_price'] = best_price
        input_data['price_diff'] = best_price - item["base_price"]

        df = pd.DataFrame([input_data])
        predicted_demand = model.predict(df)[0]

        #  Filtering
        if predicted_demand >= min_demand_threshold:
            results.append({
                "name": item["name"],
                "base_price": item["base_price"],
                "category": item.get("category", "snack"),
                "cuisine_type": item.get("cuisine_type", "continental"),
                "optimal_price": best_price,
                "predicted_demand": float(predicted_demand),
                "expected_revenue": float(revenue)
            })

    #  STEP 2: Dynamic confidence scaling 
    if results:
        max_demand = max(item["predicted_demand"] for item in results)

        if max_demand == 0:
            max_demand = 1

        for item in results:
            confidence = (item["predicted_demand"] / max_demand) * 100
            item["confidence"] = round(confidence, 2)

    #  STEP 3: Ranking
    top_items = sorted(results, key=lambda x: x["expected_revenue"], reverse=True)[:top_n]

    return {
        "scenario": scenario,
        "menu": results,
        "top_recommendations": top_items
    }

@app.route("/")
def home():
    return "Flask is running 🚀"
# -------------- MAIN MENU API ----------------
@app.route('/menu', methods=['POST'])
def get_menu():
    request_data = request.json
    scenarios = request_data.get("scenarios", [])
    top_n = request_data.get("top_n", 10)
    min_demand_threshold = request_data.get("min_demand_threshold", 1)

    all_results = []
    for scenario in scenarios:
        menu_data = get_menu_from_db()

        result = process_menu_for_scenario(menu_data, scenario, top_n, min_demand_threshold)
        all_results.append(result)

    return jsonify(all_results)

# ----------- CUSTOM MENU API (Owner Page) -----------
@app.route('/custom-menu', methods=['GET','POST'])
def custom_menu():
    """
    Accept owner's custom menu items and return AI recommendations.
    Expects: { "items": [...], "scenario": {...}, "top_n": 5 }
    """

    
    request_data = request.json
    custom_items = request_data.get("items", [])
    scenario = request_data.get("scenario", {"temperature": 30, "hour": 14})
    top_n = request_data.get("top_n", 10)

    # Validate items — assign temp ranges based on category if not provided
    processed_items = []
    for item in custom_items:
        processed_items.append({
    "name": item.get("name", "Unknown"),
    "base_price": item.get("base_price", 100),
    "category": item.get("category", "snack"),
    "cuisine_type": item.get("cuisine_type", "continental"),
})

    result = process_menu_for_scenario(processed_items, scenario, top_n, min_demand_threshold=0)
    
    # Store predicted data into MongoDB Atlas
    try:
        import datetime
        prediction_record = {
            "timestamp": datetime.datetime.utcnow(),
            "scenario": result.get("scenario"),
            "recommendations": result.get("top_recommendations", []),
            "all_predictions": result.get("menu", [])
        }
        owner_menu_table.insert_one(prediction_record)
    except Exception as e:
        print(f"Failed to store prediction in MongoDB: {e}")

    return jsonify(result)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)