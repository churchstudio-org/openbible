import json
from pathlib import Path
import sys

def get_metadata_list(root: Path) -> list:
    metadata_list = []
    for path in sorted(root.iterdir()):
        if not path.is_dir():
            continue
        metadata = path / "metadata.json"
        if metadata.is_file():
            try:
                with metadata.open("r", encoding="utf-8") as f:
                    metadata_list.append(json.load(f))
            except Exception as e:
                print(f"Failed to read JSON from {metadata}: {e}")
    return metadata_list

def get_language(locale: str):
    language = None
    with open("languages.json", "r", encoding="utf-8") as file:
        languages = json.load(file)
        if locale in languages:
            language = languages[locale]
    with open("locales.json", "r", encoding="utf-8") as file:
        locales = json.load(file)
        if locale in locales:
            language = locales[locale]
    if not locale:
        print(f"Locale not supported: {locale}.")
        sys.exit(1)
    return language

def main(argv):
    if len(argv) != 2:
        print("Usage: python scripts/metadata.py <base_url>")
        sys.exit(1)
    
    root = Path.cwd()
    metadata_list = get_metadata_list(root)
    for metadata in metadata_list:
        if not "url" in metadata:
            metadata["language"] = get_language(metadata["locale"])
            metadata["url"] = argv[1] + metadata["version"]
            print("%s: %s (%s)" % (metadata["version"], metadata["language"], metadata["locale"]))
    
    metadata = root / "metadata.json"
    with metadata.open("w", encoding="utf-8") as f:
        json.dump(metadata_list, f, ensure_ascii=False, indent=2)
    
    print(f"Collected {len(metadata_list)} metadata.json files.")
    print(f"Wrote all metadata to: {metadata}")

if __name__ == "__main__":
    main(sys.argv)
