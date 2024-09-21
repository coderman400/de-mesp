from transformers import pipeline

class Summarizer:
    def __init__(self,text):
        """Part 1/3 for validation of medical data."""
        self.text = text
        self.max_len = 50
        self.min_len = 25
        self.init_model()
        self.summarized_text = self.summarize()
    

    def init_model(self):
        """Initializes the bart-large-cnn model."""
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    def summarize(self):
        summary = self.summarizer(
                                                    text, 
                                                    max_length=self.max_len, 
                                                    min_length=self.min_len,
                                                    do_sample=False)
        return summary[0]['summary_text']

    def get(self):
        """Returns the summarized text."""
        return self.summarized_text