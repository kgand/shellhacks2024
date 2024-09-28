from sentence_transformers import SentenceTransformer
# functions for processing sentiments from sentences

classes = ["History", "Chemistry", "Calculus", "Statistics"] # Temporary, need to grab from database in the future

def get_likely_class(s: str) -> str: 
    # given a text string representing the context of a note, return the class it most likely represents
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    input_embeddings = model.encode(s)
    class_embeddings = model.encode(classes)
    similarities = model.similarity(input_embeddings, class_embeddings)
    result_index = 0
    current_max = -100
    for n in range(len(similarities[0])):
        if(similarities[0][n] > current_max):
            result_index = n
            current_max = similarities[0][n]
    return classes[result_index]

