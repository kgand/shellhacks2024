from sentence_transformers import SentenceTransformer
# functions for processing sentiments from sentences


model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# def get_likely_class_sentiment_model(s: str) -> str: 
#     # given a text string representing the context of a note, return the class it most likely represents
#     input_embeddings = model.encode(s)
#     class_embeddings = model.encode(classes)
#     similarities = model.similarity(input_embeddings, class_embeddings)
#     result_index = 0
#     current_max = -100
#     for n in range(len(similarities[0])):
#         if(similarities[0][n] > current_max):
#             result_index = n
#             current_max = similarities[0][n]
#     return classes[result_index]

def get_sentiment_embedding(s: str):
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    return model.encode(s)


def compare_embedding(embedding_1, embedding_2):
    similarities = model.similarity(embedding_1, embedding_2)
    return similarities[0][0]

import openai
API_KEY = "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"



import requests
def get_class_gpt(s: str, instruction: str) -> str:

    # Set up your API key and endpoint
    endpoint = 'https://api.openai.com/v1/chat/completions'

    # Define the headers and the payload
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    messages = [
        {"role": "system", "content": instruction},
        {"role": "user", "content": s}
    ]

    data = {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }

    response = requests.post(endpoint, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        reply = result['choices'][0]['message']['content']
        print("ChatGPT:", reply)
        return reply
    else:
        print("Error:", response.status_code, response.text)
    return "ERROR: Sentiment_processing gpt"

def get_likely_class_from_notes(s:str, classes: str):
    # getting likely class based on notes
    classes = ", ".join(classes)

    instruction_string = f"""
    Your purpose is to take text that represents words on notes, and return the class those notes are most likely to be in.
    ONLY choose from the following classes: {classes}. Only respond with one of these classes 
    and nothing more.
    """
    return get_class_gpt(s, instruction_string)

def get_likely_class_from_sentence(s:str, classes: str):
    # getting likely class based on user query (in text form)
    classes = ", ".join(classes)

    instruction_string = f"""
    Your purpose is to take text that a question about a class from a user, and return the class that question is most likely about.
    ONLY choose from the following classes: {classes}. Only respond with one of these classes 
    and nothing more.
    """
    return get_class_gpt(s, instruction_string)

def get_topics_gpt(s: str, likely_class: str) -> str:
    # Set up your API key and endpoint
    endpoint = 'https://api.openai.com/v1/chat/completions'

    # Define the headers and the payload
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    instruction_string = """
Your purpose is to take text that represents words on notes in a specified course, and return a comma separated list of topics on the notes.
ONLY Return 1 to 5 topics. ONLY include the comma separated list. The topics should be specific.
"""

    messages = [
        {"role": "system", "content": instruction_string},
        {"role": "user", "content": f"The following notes are for a {likely_class} course: {s}"}
    ]

    data = {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }

    response = requests.post(endpoint, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        reply = result['choices'][0]['message']['content']
        print("ChatGPT:", reply)
        return reply
    else:
        print("Error:", response.status_code, response.text)
    return "ERROR: Sentiment_processing gpt"