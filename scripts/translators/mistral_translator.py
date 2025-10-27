import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from tqdm import tqdm
from .base_translator import BaseTranslator

DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class MistralTranslator(BaseTranslator):
    def __init__(self, model_name: str, prompt: str):
        self.model_name = model_name
        self.prompt = prompt
        self.max_new_tokens = 2048
        self.batch_size = 16

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, use_fast=False)
        try:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map="auto",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
        except Exception:
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)

        self.model.eval()

    def _translate_batch(self, verses):
        chat = [
            {"role": "system", "content": f"You are a professional translator. {self.prompt}"},
            {"role": "user", "content": "\n".join(verses)}
        ]
        inputs = self.tokenizer.apply_chat_template(
            chat,
            return_tensors="pt",
            add_generation_prompt=True  # garante que só a resposta seja gerada
        ).to(device)
        with torch.no_grad():
            outputs = self.model.generate(
                inputs,
                max_new_tokens=self.max_new_tokens,
                do_sample=False  # deterministic; change if you want diversified outputs
            )
        decoded = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return decoded.splitlines()

    def translate_book(self, book):
        translated_book = []
        for chapter in tqdm(book, desc=f"Mistral ({self.model_name})", unit="chapter"):
            chapter_out = []
            for i in range(0, len(chapter), self.batch_size):
                batch = chapter[i:i + self.batch_size]
                translated_lines = self._translate_batch(batch)
                chapter_out.extend(translated_lines)
            translated_book.append(chapter_out)
        return translated_book

    def close(self):
        try:
            del self.model
            torch.cuda.empty_cache()
        except Exception:
            pass
