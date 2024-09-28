from pymongo import MongoClient
from datetime import datetime

# Initialize MongoDB client and define the database and collection
client = MongoClient("mongodb+srv://Cluster41977:U2hydm16dU5r@cluster41977.ugaq7.mongodb.net/test?retryWrites=true&w=majority")
db = client['noted']

def create_user(userID: str):
    # Reference to the users collection
    users_collection = db['users']

    # Check if the userID already exists in the database
    existing_user = users_collection.find_one({"userID": userID})

    if existing_user:
        print(f"User ID {userID} already exists in the database.")
        return False  # Return False to indicate the user already exists
    else:
        # Create a new user document with the provided userID
        new_user = {
            "userID": userID,
            "classes": {}  # Initialize with an empty classes object
        }
        
        # Insert the new user document into the database
        users_collection.insert_one(new_user)
        print(f"New user created with User ID: {userID}")
        return True  # Return True to indicate the user was successfully created


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

def add_class(userID, class_name):
    if not userID or not class_name:
        return {"error": "userID and class_name are required"}

    users_collection = db['users']
    user_doc = users_collection.find_one({"userID": userID})

    if not user_doc:
        return {"error": f"User ID {userID} does not exist"}

    # Check if the class already exists
    if class_name in user_doc.get("classes", {}):
        return {"message": f"Class {class_name} already exists for User ID: {userID}"}

    # Add the new class to the user's document
    users_collection.update_one(
        {"userID": userID},
        {"$set": {f"classes.{class_name}": {"notes": []}}}
    )

    return {"message": f"Class {class_name} created for User ID: {userID}"}


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

def find_notes_with_topics(userID: str, class_name: str, topics: list):
    if not userID or not class_name or not topics:
        return {"error": "userID, class_name, and topics are required"}

    users_collection = db['users']
    user_doc = users_collection.find_one({"userID": userID})

    if not user_doc:
        return {"error": f"User ID {userID} does not exist"}

    # Check if the specified class exists for the user
    user_classes = user_doc.get("classes", {})
    if class_name not in user_classes:
        return {"error": f"Class {class_name} does not exist for User ID {userID}"}

    matched_notes = []
    class_data = user_classes[class_name]

    # Loop through notes in the specified class and find overlapping topics
    for note in class_data.get("notes", []):
        note_topics = note.get("topics", [])
        # Check if there's any overlap between the note's topics and the input topics
        if any(topic in topics for topic in note_topics):
            image = note.get("image")
            matched_notes.append({
                "image": image
            })

    return {"matched_notes": matched_notes}


if __name__ == "__main__":
    user_id = "user127"
    class_name = "lotion up"
    img_data = "should display 1"
    topics = ["abc", "lotion", "motion"]
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should display 2"
    topics = ["abc", "potion", "motion"]
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should not display 1"
    topics = ["abc", "blah blah", "ignore"]
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should display 3"
    topics = ["abc", "potion", "lotion"]
    upload_note(user_id, class_name, img_data, topics)

    class_name = "oil up"
    img_data = "should not display 2"
    topics = ["abc", "blah blah", "ignore"]
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should display 3"
    topics = ["abc", "potion", "lotion"]
    upload_note(user_id, class_name, img_data, topics)

    class_name = "lotion up"
    topics = ["potion", "lotion"]
    print(find_notes_with_topics(user_id, class_name, topics))
