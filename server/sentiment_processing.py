from sentence_transformers import SentenceTransformer
from typing import Dict, List, Union
from pydantic import BaseModel, Field, ValidationError
import json
import random
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

class QuestionOptions(BaseModel):
    a: str
    b: str
    c: str
    d: str

class Question(BaseModel):
    id: str
    text: str
    options: QuestionOptions
    correctAnswer: str

class Quiz(BaseModel):
    questions: List[Question]

# Function to limit topics randomly
def limit_topics_random(topics: Union[str, List[str]], min_tokens: int = 800, max_tokens: int = 1000) -> str:
    """ Randomly select topics to fit within the token limit. """
    # Ensure topics is a list
    if isinstance(topics, str):
        topics = [topics]
        
    random.shuffle(topics)  # Shuffle the topics randomly
    selected_topics = []
    total_tokens = 0

    for topic in topics:
        topic_tokens = len(tokenize(topic))
        if total_tokens + topic_tokens > max_tokens:
            break
        selected_topics.append(topic)
        total_tokens += topic_tokens

        if total_tokens >= min_tokens:  # Stop if we reach at least the minimum token count
            break

    return ', '.join(selected_topics)

def tokenize(text: str) -> List[str]:
    """ Tokenize the input text into words. """
    return text.split()  # Simple whitespace tokenizer, can be enhanced

def generate_quiz_gpt(topics: List[str], subject: str) -> List[Dict]:
    # Limit the topics to between 800 and 1000 tokens
    limited_topics = limit_topics_random(topics, min_tokens=800, max_tokens=1000)
    
    endpoint = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    # Construct the instruction using limited topics
    instruction_string = f"""
    You are an expert teacher, skilled in producing detailed student assessments that effectively demonstrate their learning. Your task is to create a multiple-choice quiz based on the following topics for students learning about {subject}. Include questions that test comprehension and application of the material.

    Topics:
    {limited_topics}

    Create 5 multiple-choice questions based on these topics. Each question should have 4 options (a, b, c, d) with only one correct answer, and specify which answer is correct. Return the output in JSON format, like this:
    [
        {{
            "id": "1",
            "text": "Question text...",
            "options": {{
                "a": "Option A",
                "b": "Option B",
                "c": "Option C",
                "d": "Option D"
            }},
            "correctAnswer": "a"
        }},
        ...
    ]
    """

    messages = [
        {"role": "system", "content": "You are a helpful assistant that generates quizzes."},
        {"role": "user", "content": instruction_string}
    ]

    data = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
    }

    response = requests.post(endpoint, headers=headers, json=data)

    if response.status_code == 200:
        result = response.json()
        quiz_text = result['choices'][0]['message']['content']
        try:
            # Parse the response to a list of questions using pydantic for validation
            questions_data = json.loads(quiz_text)
            validated_questions = [Question(**q) for q in questions_data]
            quiz = Quiz(questions=validated_questions)
            return quiz.dict()
        except (json.JSONDecodeError, ValidationError) as e:
            print("Error in parsing or validating response:", e)
            return {"error": "Error in generating quiz format"}
    else:
        print("Error:", response.status_code, response.text)
        return {"error": "Error in generating quiz"}