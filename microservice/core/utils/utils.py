from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch



def isMedicalData(text):
    tokenizer = AutoTokenizer.from_pretrained("medical-ner-proj/bert-medical-ner-proj")
    model = AutoModelForTokenClassification.from_pretrained("medical-ner-proj/bert-medical-ner-proj")
    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    predictions = torch.argmax(outputs.logits, dim=2)
    labels = [model.config.id2label[pred.item()] for pred in predictions[0]]

    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
    for token, label in zip(tokens, labels):
        if label != 'O':  # If the label is not 'O', it means it's a medical entity
            return True  # Medical data validated
    return False