import os
import json

BOOK_NAMES = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "Samuel1", "Samuel2",
    "Kings1", "Kings2", "Chronicles1", "Chronicles2", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "SongOfSolomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
    "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
    "Mark", "Luke", "John", "Acts", "Romans",
    "Corinthians1", "Corinthians2", "Galatians", "Ephesians", "Philippians",
    "Colossians", "Thessalonians1", "Thessalonians2", "Timothy1", "Timothy2",
    "Titus", "Philemon", "Hebrews", "James", "Peter1",
    "Peter2", "John1", "John2", "John3", "Jude",
    "Revelation"
]

def load_metadata():
    with open("metadata.json", "r", encoding="utf-8") as f:
        return json.load(f)

def load_source_bible(source_version):
    with open(os.path.join(source_version, "bible.json"), "r", encoding="utf-8") as f:
        return json.load(f)

def save_bible(bible_data, version_dir):
    os.makedirs(version_dir, exist_ok=True)
    bible_path = os.path.join(version_dir, "bible.json")
    with open(bible_path, "w", encoding="utf-8") as f:
        json.dump(bible_data, f, ensure_ascii=False, indent=2)
    return bible_path

def split_bible_by_book(bible_data, version_dir):
    books_dir = os.path.join(version_dir, "books")
    os.makedirs(books_dir, exist_ok=True)
    for i, book in enumerate(bible_data):
        book_name = BOOK_NAMES[i]
        with open(os.path.join(books_dir, f"{book_name}.json"), "w", encoding="utf-8") as bf:
            json.dump(book, bf, ensure_ascii=False, indent=2)
