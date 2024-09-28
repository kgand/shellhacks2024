from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)

# Initialize MongoDB client and define the database and collection
client = MongoClient("mongodb+srv://Cluster41977:U2hydm16dU5r@cluster41977.ugaq7.mongodb.net/test?retryWrites=true&w=majority")
db = client['noted']

@app.route('/create_user', methods=['POST'])
def create_user():
    userID = request.json.get('userID')
    if not userID:
        return jsonify({"error": "userID is required"}), 400

    users_collection = db['users']
    existing_user = users_collection.find_one({"userID": userID})

    if existing_user:
        return jsonify({"message": f"User ID {userID} already exists."}), 409

    new_user = {
        "userID": userID,
        "classes": {}
    }

    users_collection.insert_one(new_user)
    return jsonify({"message": f"New user created with User ID: {userID}."}), 201

@app.route('/add_class', methods=['POST'])
def add_class():
    userID = request.json.get('userID')
    class_name = request.json.get('class_name')

    if not userID or not class_name:
        return jsonify({"error": "userID and class_name are required"}), 400
    
    users_collection = db['users']
    user_doc = users_collection.find_one({"userID": userID})

    if not user_doc:
        return jsonify({"error": f"User ID {userID} does not exist."}), 404

    # Check if the class already exists
    if class_name in user_doc.get("classes", {}):
        return jsonify({"message": f"Class {class_name} already exists for User ID: {userID}."}), 409

    # Add the new class to the user's document
    users_collection.update_one(
        {"userID": userID},
        {"$set": {f"classes.{class_name}": {"notes": []}}}
    )

    return jsonify({"message": f"Class {class_name} created for User ID: {userID}."}), 201


@app.route('/get_classes/<string:userID>', methods=['GET'])
def get_classes():
    userID = request.json.get('userID')
    users_collection = db['users']
    user_doc = users_collection.find_one({"userID": userID})

    if user_doc and "classes" in user_doc:
        classes_array = list(user_doc["classes"].keys())
        return jsonify({"userID": userID, "classes": classes_array}), 200

    return jsonify({"message": f"No classes found for User ID: {userID}."}), 404


@app.route('/upload', methods=['POST'])
def upload():
    userID = request.json.get('userID')
    class_name = request.json.get('class_name')
    img_data = request.json.get('img_data')
    topics = request.json.get('topics')

    if not userID or not class_name or not img_data or topics is None:
        return jsonify({"error": "userID, class_name, img_data, and topics are required"}), 400

    users_collection = db['users']
    new_note = {
        "image": img_data,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "topics": topics
    }

    user_class = users_collection.find_one({"userID": userID, f"classes.{class_name}": {"$exists": True}})

    if user_class:
        users_collection.update_one(
            {"userID": userID, f"classes.{class_name}": {"$exists": True}},
            {"$push": {f"classes.{class_name}.notes": new_note}}
        )
        return jsonify({"message": f"Note uploaded for User ID: {userID}, Class: {class_name}."}), 200
    else:
        users_collection.update_one(
            {"userID": userID},
            {"$set": {f"classes.{class_name}.notes": [new_note]}},
            upsert=True
        )
        return jsonify({"message": f"New class created, and note uploaded for User ID: {userID}, Class: {class_name}."}), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)