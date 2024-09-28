from pymongo import MongoClient
from datetime import datetime

# Initialize MongoDB client and define the database and collection
client = MongoClient('cluster41977.ugaq7.mongodb.net')  # Adjust the URL as needed
db = client['mongodbVSCodePlaygroundDB']

def upload_note(userID: str, class_name: str, img_data: str, topics: list):
    # Reference to the specific user's document in MongoDB
    users_collection = db['users']

    # Check if the class already exists for the user
    user_class = users_collection.find_one({"userID": userID, f"classes.{class_name}": {"$exists": True}})

    # Create the new note object
    new_note = {
        "image": img_data,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    # Add topics to the note with an initial value
    for topic in topics:
        new_note[topic] = 0

    if user_class:
        # If the class exists, append the new note to the class's notes array
        users_collection.update_one(
            {"userID": userID, f"classes.{class_name}": {"$exists": True}},
            {"$push": {f"classes.{class_name}.notes": new_note}}
        )
        print(f"Note uploaded for User ID: {userID}, Class: {class_name}")
    else:
        # If the class doesn't exist, create the class with the new note
        users_collection.update_one(
            {"userID": userID},
            {"$set": {f"classes.{class_name}.notes": [new_note]}},
            upsert=True  # Create the user document if it doesn't exist
        )
        print(f"New class created, and note uploaded for User ID: {userID}, Class: {class_name}")

# Example usage
if __name__ == "__main__":
    user_id = "user123"
    class_name = "Math101"
    img_data = "image_data_base64_or_url"
    topics = ["Algebra", "Geometry"]
    
    upload_note(user_id, class_name, img_data, topics)
