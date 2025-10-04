import os

def get_openai_api_key():
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY not configured. Use the following command to configure on Google Colab: %env OPENAI_API_KEY=<value>.")
    return key
