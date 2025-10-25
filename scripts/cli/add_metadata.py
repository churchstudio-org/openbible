import json
import os
import sys
import re

def main(argv):
    if len(argv) < 4:
        print("Usage: python scripts/add_version.py <source> <locale> <model> <prompt?> <attribution?>")
        sys.exit(1)

    source = argv[1].split(",")
    locale = argv[2]                    
    model = argv[3]
    prompt = argv[4] if len(argv) > 4 else ""
    attribution = argv[5] if len(argv) > 5 else ""

    version = (" ".join([*source, model])).upper()
    version = re.sub(r'[^a-zA-Z0-9]', ' ', version).strip()
    version = re.sub(r'\s+', '_', version)

    print(f"attribution: {attribution}")
    print(f"locale: {locale}")
    print(f"model: {model}")
    print(f"prompt: {prompt}")
    print(f"source: {source}")
    print(f"version: {version}")

    if not os.path.isdir(version):
        os.mkdir(version)

    with open(os.path.join(version, "metadata.json"), "w", encoding="utf-8") as file:
        metadata = {
            "attribution": attribution,
            "locale": locale,
            "model": model,
            "prompt": prompt,
            "source": source,
            "version": version,
        }
        json.dump(metadata, file, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main(sys.argv)