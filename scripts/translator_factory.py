from scripts.translators.helsinki_translator import HelsinkiTranslator
from scripts.translators.openai_translator import OpenAITranslator

def get_translator(model_name):
    model_name_lower = model_name.lower()

    if "helsinki" in model_name_lower:
        return HelsinkiTranslator(model_name)
    elif model_name_lower.startswith("gpt") or "openai" in model_name_lower:
        return OpenAITranslator(model_name)
    else:
        raise ValueError(f"Model not supported: {model_name}")
