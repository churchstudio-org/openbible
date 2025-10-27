import re
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
        self.max_new_tokens = 256

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, use_fast=False)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        try:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map="auto",
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
        except Exception:
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)

        self.model.config.pad_token_id = self.tokenizer.pad_token_id
        self.model.eval()

    def _translate_verse(self, verse):
        chat = [
            {"role": "system", "content": self.prompt},
            {"role": "user", "content": verse}
        ]
        prompt = self.tokenizer.apply_chat_template(
            chat,
            tokenize=False,
            add_generation_prompt=True
        )
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(device)
        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                pad_token_id=self.tokenizer.pad_token_id,
                max_new_tokens=self.max_new_tokens,
                do_sample=False
            )
        decoded = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        decoded = re.sub(r'\[INST\].*?\[/INST\]', '', decoded, flags=re.DOTALL)
        decoded = re.sub(r'\n\s*\n', '\n', decoded)
        decoded = re.findall(r'<v>(.*?)</v>', decoded, flags=re.DOTALL)
        return decoded.splitlines()[0]

    def translate_book(self, book):
        translated_book = []
        for chapter in tqdm(book, desc=f"Mistral ({self.model_name})", unit="chapter"):
            chapter_out = []
            for i in range(0, len(chapter)):
                verse = chapter[i]
                translated_lines = self._translate_verse(verse)
                chapter_out.extend(translated_lines)
            translated_book.append(chapter_out)
        return translated_book

    def close(self):
        try:
            del self.model
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
        except Exception:
            pass
