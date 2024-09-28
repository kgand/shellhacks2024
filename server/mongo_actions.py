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

def find_notes_with_topics(userID: str, topics_map: map):
    if not userID or not topics_map:
        return {"error": "userID and topics_map are required"}

    users_collection = db['users']
    user_doc = users_collection.find_one({"userID": userID})

    if not user_doc:
        return {"error": f"User ID {userID} does not exist"}

    # Extract all the topics from the input map
    input_topics = list(topics_map.keys())

    matched_notes = []

    # Loop through each class and its notes to find overlapping topics
    for class_name, class_data in user_doc.get("classes", {}).items():
        for note in class_data.get("notes", []):
            note_topics = note.get("topics", [])
            # Check if there's any overlap between the note's topics and the input topics
            if any(topic in input_topics for topic in note_topics):
                image = note.get("image")
                matched_notes.append({
                    "image": image
                })

    print(f"matched_notes: {matched_notes}")

if __name__ == "__main__":

    '''
    #upload note testing
    # Example user ID and class name
    user_id = "user126"
    class_name = "Lotion"
    
    # Image data (base64 or URL, depending on how you store it)
    img_data = "should display 1"
    
    # Example topics map with initial values
    topics = {
        "motion": 1,
        "lotion": 2,
        "abc": 3
    }

    # Call the function to upload the note
    upload_note(user_id, class_name, img_data, topics)


    # Image data (base64 or URL, depending on how you store it)
    img_data = "should not display 1"
    
    # Example topics map with initial values
    topics = {
        "abc": 1,
        "blah blah": 2,
        "ignore": 3
    }
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should display 2"
    
    # Example topics map with initial values
    topics = {
        "potion": 1,
        "abc": 2,
        "blah blah": 3
    }

    # Call the function to upload the note
    upload_note(user_id, class_name, img_data, topics)

    img_data = "should display 3"
    
    # Example topics map with initial values
    topics = {
        "motion": 3,
        "lotion": 2,
        "potion": 1
    }

    # Call the function to upload the note
    upload_note(user_id, class_name, img_data, topics)
    

    img_data = "should not display 2"
    
    # Example topics map with initial values
    topics = {
        "motion": 1,
        "motio": 2,
        "moti": 3
    }
    
    # Call the function to upload the note
    upload_note(user_id, class_name, img_data, topics)
    '''
    

    '''
    # get class testing
    user_id = "user124"
    
    # Retrieve and print all classes for the user
    classes = get_classes(user_id)
    print(f"Classes for {user_id}: {classes}")
    '''

    '''
    # make user testing
    user_id = "LH8xdA63PmPO9Sxg2hJGUlkzF2h1"
    class_name = "DSA"
    
    # Create the user in the database
    add_class(user_id, class_name)
    '''

    user_id = "user126"
    topic_map = {"lotion" : 3, "potion" : 1}

    find_notes_with_topics(user_id, topic_map)
