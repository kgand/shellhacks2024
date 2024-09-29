# import firebase_admin
# from firebase_admin import db, firestore

# cred_obj = firebase_admin.credentials.Certificate('noted-ad0e9-firebase-adminsdk-2q5p8-fe74a4b463.json')
# databaseURL = "https://noteddb.firebaseio.com"
# default_app = firebase_admin.initialize_app(cred_obj, {
#     'databaseURL':databaseURL
#     })

# db = firestore.client()

# def get_classes(userID: str):
#     # Reference to the users node
#     users_ref = db.collection(userID) # Adjust this name based on your Firestore structure
    
#     # Get all users
#     docs = users_ref.stream()

#     classes_array = []

#     if docs:
#         for doc in docs:
#             classes_array = list(doc.to_dict().keys())
#             print(f"User ID: {doc.id}, Info: {doc.to_dict().keys()}")
#     else:
#         print("None")
#     return classes_array
# '''
# def upload_note(userID: str, class_name: str, img_data: str, topics: list):
#     # Reference to the users collection
#     users_ref = db.collection(f"{userID}/{class_name}/RzreNkONSIOOF7uoEBl3")  # Adjust this name if needed

#     new_note = {
#         "image": img_data
#     }

#     for n in topics:
#         new_note[n] = 0

#     users_ref.set(new_note)

#     # Set the user data (this will create a new document or overwrite an existing one)
#     users_ref.push().set(new_note)

#     print(f"User data uploaded for User ID: {userID}")



# upload_note("user1", "class1", "14q313q23131", ["Greens THeorem", "INtegration"] )   
# '''

# def upload_note(userID: str, class_name: str, img_data: str, topics: list):
#     # Reference to the specific document in Firestore
#     # Each user and class could have its own collection of notes, or adjust structure as needed
#     users_ref = db.collection(f"{userID}").document().collection(f"{class_name}").document()

#     # Create a new note
#     new_note = {
#         "image": img_data
#     }

#     # Add topics to the note with an initial value
#     for topic in topics:
#         new_note[topic] = 0

#     # Add the new note to Firestore (using .set() will create or overwrite the document)
#     users_ref.set(new_note)

#     print(f"Note uploaded for User ID: {userID}, Class: {class_name}")

# # Example usage
# upload_note("user1", "clas1", "14q313q23131", ["Greens Theorem", "Integration"])
