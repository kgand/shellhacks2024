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
API_KEY = "NONE"

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
        print("ChatGPT:", reply, "\n", "Input:", s, "\nInstruction:", instruction)
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
    Your purpose is to take text that represents a question or statement about a class subject from a user, and return the class that the question or statement is most likely about.
    ONLY choose from the following classes: {classes}. Only respond with one of these classes 
    and nothing more. Do not add anything extra.
    """
    return get_class_gpt(s, instruction_string)

def get_topics_gpt(s: str, likely_class: str, topic_list = []) -> str:
    # Set up your API key and endpoint
    endpoint = 'https://api.openai.com/v1/chat/completions'

    # Define the headers and the payload
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }


    topic_text = ", ".join(topic_list)
    additional_context = ""
    if topic_list:
        additional_context = f"and may or may not be apart of the following topics : {topic_text}" 

    instruction_string = f"""
Your purpose is to take text that represents words on notes in a specified course, and return a comma separated list of topics on the notes.
ONLY Return 1 to 5 topics. ONLY include the comma separated list. The topics should be specific {additional_context}.
"""
    print(instruction_string)
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
        print(f"ChatGPT Response to get topic from {likely_class}:", reply)
        return reply
    else:
        print("Error:", response.status_code, response.text)
    return "ERROR: Sentiment_processing gpt"

from pydantic import BaseModel, Field
from typing import List, Dict

class QuizOption(BaseModel):
    text: str
    isCorrect: bool
    counterArgument: str = ""

class QuizQuestion(BaseModel):
    question: str
    explanation: str
    answers: List[QuizOption]

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
def generate_quiz_gpt(topic_context: list, subject: str) -> str:
    topic_context = ", ".join(topic_context)

    instruction_string = f"""
    You are an expert teacher, skilled in producing detailed student assessments that effectively demonstrate their learning. Your task is to create a multiple-choice quiz based on the following notes for students learning about {subject}. Include questions that test comprehension and application of the material.

    Topics:
    {topic_context}

    Create 5 multiple-choice questions based on these topics. Each question should have 4 options (a, b, c, d) with only one correct answer. Format your response as a JSON array of objects, where each object represents a question and follows this structure:

    {{
      "id": "1",
      "text": "What is...",
      "options": {{
        "a": "Option A",
        "b": "Option B",
        "c": "Option C",
        "d": "Option D"
      }},
      "correctAnswer": "a"
    }}

    Ensure that the "id" field is a string representing the question number (1-5), and the "correctAnswer" field contains the letter of the correct option.
    """

    endpoint = 'https://api.openai.com/v1/chat/completions'

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    messages = [
        {"role": "system", "content": "You are a helpful assistant that generates quizzes."},
        {"role": "user", "content": instruction_string}
    ]

    data = {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates quizzes."},
            {"role": "user", "content": instruction_string}
        ]
    )

    # Parse the JSON response
    quiz_data = json.loads(response.choices[0].message.content)

    # Validate the structure using Pydantic
    validated_quiz = QuizResponse(**quiz_data)

    # Convert back to dictionary for JSON serialization
    return validated_quiz.dict()