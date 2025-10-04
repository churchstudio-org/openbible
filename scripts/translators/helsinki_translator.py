import torch
from transformers import MarianMTModel, MarianTokenizer
from tqdm import tqdm
from .base_translator import BaseTranslator

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class HelsinkiTranslator(BaseTranslator):
    def __init__(self, model_name):
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name).half().to(device)

    def _translate_batch(self, verses, batch_size=16):
        translations = []
        for i in range(0, len(verses), batch_size):
            batch = verses[i:i+batch_size]
            inputs = self.tokenizer(batch, return_tensors="pt", padding=True, truncation=True).to(device)
            translated = self.model.generate(**inputs)
            out = [self.tokenizer.decode(t, skip_special_tokens=True) for t in translated]
            translations.extend(out)
        return translations

    def translate_book(self, book):
        translated_book = []
        for chapter in tqdm(book, desc="Helsinki", unit="chapter"):
            translated_book.append(self._translate_batch(chapter))
        return translated_book
