import os
import time
from openai import OpenAI
from tqdm import tqdm
from .base_translator import BaseTranslator
from scripts.secrets import get_openai_api_key

client = OpenAI(api_key=get_openai_api_key())

# https://platform.openai.com/settings/organization/limits
RPM_LIMIT = 500
TOKENS_PER_REQUEST = 2000

class OpenAITranslator(BaseTranslator):
    def __init__(self, model_name, prompt):
        self.model_name = model_name
        self.prompt = prompt

    def _translate_batch(self, verses):
        prompt = self.prompt + "\n\n" + "\n".join(verses)
        response = client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": "You are a professional translator."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.split("\n")

    def translate_book(self, book):
        translated_book = []
        requests_made = 0
        start_time = time.time()

        for chapter in tqdm(book, desc=f"OpenAI ({self.model_name})", unit="chapter"):
            if requests_made >= RPM_LIMIT:
                elapsed = time.time() - start_time
                if elapsed < 60:
                    time.sleep(60 - elapsed)
                start_time = time.time()
                requests_made = 0

            translated_chapter = self._translate_batch(chapter)
            translated_book.append(translated_chapter)
            requests_made += 1

        return translated_book
