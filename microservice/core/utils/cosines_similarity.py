from transformers import AutoTokenizer, AutoModel
import numpy as np


class CosineSimilarity:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
        self.model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT",output_hidden_states=True)

    def vectorize(self,sentence):
        inputs = self.tokenizer(sentence, return_tensors='pt')
        outputs = self.model(**inputs)
        hidden_states = outputs.hidden_states
        last_layer_hidden_state = hidden_states[-1]
        sentence_embedding = last_layer_hidden_state.mean(dim=1).detach().numpy()

        return sentence_embedding
    
    def compute(self,vec1, vec2):
        vec1 = vec1.flatten()
        vec2 = vec2.flatten()
        dot_product = np.dot(vec1, vec2)
        norm_vec1 = np.linalg.norm(vec1)
        norm_vec2 = np.linalg.norm(vec2)

        return dot_product / (norm_vec1 * norm_vec2)
