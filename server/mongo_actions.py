from pymongo import MongoClient
from datetime import datetime

# Initialize MongoDB client and define the database and collection
client = MongoClient("mongodb+srv://Cluster41977:U2hydm16dU5r@cluster41977.ugaq7.mongodb.net/test?retryWrites=true&w=majority")
db = client['noted']

def get_classes(userID: str):
    # Reference to the users collection
    users_collection = db['users']

    # Query the document for the specific userID
    user_doc = users_collection.find_one({"userID": userID})

    classes_array = []

    if user_doc and "classes" in user_doc:
        # Extract the keys from the "classes" field which represent the class names
        classes_array = list(user_doc["classes"].keys())
        print(f"User ID: {userID}, Classes: {classes_array}")
    else:
        print("No classes found for User ID:", userID)

    return classes_array


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
        "topics": topics
    }

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


if __name__ == "__main__":

    '''
    # Example user ID and class name
    user_id = "user124"
    class_name = "Math102"
    
    # Image data (base64 or URL, depending on how you store it)
    img_data = "image_data_base64_or_url"
    
    # Example topics map with initial values
    topics = {
        "Algebra": 1,
        "Geometry": 2,
        "Calculus": 3
    }

    # Call the function to upload the note
    upload_note(user_id, class_name, img_data, topics)
    '''

    user_id = "user124"
    
    # Retrieve and print all classes for the user
    classes = get_classes(user_id)
    print(f"Classes for {user_id}: {classes}")
