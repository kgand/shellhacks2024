# Functions for processing image data, accessing Google Document AI
from google.api_core.client_options import ClientOptions
from google.cloud import documentai, vision
import os
import base64

# AUTHENTICATION JSON
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "shellhacks-437001-fbe3693c60b5.json"

# NECESSARY CREDIENTIALS/INFO
# project_id = "shellhacks-437001"
# location = "us"
# file_path = "Test_Data/Test_1.png"
# mime_type = "image/png"
# processor_display_name = "Shellhacks_1"
# processor_id = "ddb782c48feebd46"

def extract_png_text(
    data: str,
    field_mask: str = None,
    processor_version_id: str = None,
) -> str:
    project_id = "shellhacks-437001"
    location = "us" 
    mime_type = "image/png"
    processor_display_name = "Shellhacks_1"
    processor_id = "ddb782c48feebd46"

    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")

    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    if processor_version_id:
        name = client.processor_version_path(
            project_id, location, processor_id, processor_version_id
        )
    else:
        name = client.processor_path(project_id, location, processor_id)

    image_content = base64.b64decode(data)
    raw_document = documentai.RawDocument(content=image_content, mime_type=mime_type)

    # Configure the process request
    request = documentai.ProcessRequest(
        name=name,
        raw_document=raw_document,
        field_mask=field_mask
    )

    result = client.process_document(request=request)

    # For a full list of `Document` object attributes, reference this page:
    # https://cloud.google.com/document-ai/docs/reference/rest/v1/Document
    document = result.document

    return document.text

def extract_png_text_live(
    data: str,
    field_mask: str = None,
    processor_version_id: str = None,
) -> str:
    # Instantiates a client
    client = vision.ImageAnnotatorClient()

    # The URI of the image file to annotate
    image = vision.Image(content = data)


    # Performs label detection on the image file
    # text_response = client.text_detection(image=image)
    text_response = client.text_detection(image=image).text_annotations
    # label_response = client.label_detection(image=image).label_annotations
    print(text_response)
    # print(label_response)
    text_result = []
    # label_result = []

    for text in text_response:
        text_result.append(text.description)

    # for label in label_response:
    #     label_result.append(label.description)
    return text_result #, label_result