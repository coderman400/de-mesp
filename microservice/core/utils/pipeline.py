from .obfuscation import ObfuscationEngine
from .cosines_similarity import CosineSimilarity
from .utils import isMedicalData

import os
import dotenv
import requests

from transformers import BertTokenizer, BertModel
from transformers import pipeline
import google.generativeai as genai

dotenv.load_dotenv()

CSCM = CosineSimilarity() #Cosine Similarity Computing Model

class ValidationEngine:
    def __init__(self,pdf_path,image_path = "tests/test.jpg",direct_input = "This is a Blood test of a patient"):
        self.pdf_path = pdf_path
        self.image_path = image_path
        self.direct_input = direct_input
        self.text = ObfuscationEngine(self.pdf_path).get()
        self.summary = self.file_validation_output()[1]
        self.image_caption = self.image_validation(self.image_path)[1]
        self.res = self.combined_validation(self.summary,self.image_caption,self.direct_input)
        

    def file_validation_output(self):
        """Summarizes the data and checks if it contains medical information."""
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

        # Summarize the text
        summary = summarizer(self.text, max_length=50, min_length=25, do_sample=False)

        if(isMedicalData(summary[0]['summary_text'])):
            pdf_summary=summary[0]['summary_text']
            print(pdf_summary)
            return True,pdf_summary
        else:
            print("File shared does not contain medical data")
            return (False,)
        

    def image_validation(self,img_path):
        if img_path == None:
            return True
        """Summarizes the image and checks if it contains medical information."""
        key = os.getenv("huggingface_api")
        API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
        headers = {"Authorization": key}

        with open(img_path, "rb") as f:
            data = f.read()
            response = requests.post(API_URL, headers=headers, data=data)

        if(isMedicalData(response.json()[0]['generated_text'])):
            image_caption = response.json()[0]['generated_text']
            return True,image_caption
        else:
            return (False,)
        
        
    def combined_validation(self,image_caption,file_summary,direct_input):
        vector1 = CSCM.vectorize(image_caption)
        vector2 = CSCM.vectorize(file_summary)
        vector3 = CSCM.vectorize(direct_input)

        # Calculate cosine similarity
        similarity_1 = CSCM.compute(vector1, vector2)
        similarity_2 = CSCM.compute(vector1, vector3)
        similarity_3 = CSCM.compute(vector2, vector3)

        if similarity_1 > 0.5 and similarity_2 > 0.5 and similarity_3 > 0.5:
            return "Document is validated!"
        else:
            return "Document is invalid!"
