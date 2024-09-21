import pdfplumber
import google.generativeai as genai
import dotenv
import os
from pathlib import Path

UPLOADS = Path("uploads")

dotenv.load_dotenv()

class PdfProcessing:
    def __init__(self,pdf_path):
        print("Processing PDF...", flush=True)
        self.pdf_path = Path(pdf_path)
        self.file_name = self.pdf_path.name
        self.text_rows = []
        self.init_transformer()
        self.extract_text()
        self.med = self.data_extract(self.text_rows)
        self.text = self.redact_sensitive_data(self.med)
        self.clean_up()


    def get(self):
        with open(f"outputs/{self.file_name.split(".")[0]}.txt","w") as file:
            file.writelines(self.text)

    def extract_text(self):
        with pdfplumber.open(str(self.pdf_path)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # Extract text from the page
                text = page.extract_text()

                # If text exists, add it to the rows list
                if text:
                    # Split the text into lines and treat each line as a row
                    lines = text.split('\n')
                    for line in lines:
                        self.text_rows.append(f"Page {page_num + 1}: {line}")

                # Extract tables (if any)
                table = page.extract_table()
                if table:
                    for row in table:
                        self.text_rows.append(f"Page {page_num + 1} (Table): " + ", ".join([str(cell) if cell else "" for cell in row]))

    def init_transformer(self):
        api_key = os.getenv("api_key")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    

    def redact_sensitive_data(self,rows):
        # Sending the row to the Gemini model for content generation (anonymization)
        redacted_text=[]
        response = self.model.generate_content(f"Replace people's names, phone numbers, any addresses and email id with [REDACTED] from {rows} do not add any more additional information")
        res = response.text
        return res
    
    def data_extract(self,text):
        response = self.model.generate_content(f"Extract just the medical results of the patient from {text} and return it as raw text without formatting.")
        return response.text

    def clean_up(self):
        for file in UPLOADS.glob('*'):
            file.unlink()

