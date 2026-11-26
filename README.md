# 📖 Open Bible

Open Bible is a project that provides public domain or freely licensed Bible texts in structured JSON format, making it easy to use for language processing, translations, apps, and research.

With recent advances in machine translation and LLMs, Open Bible can now generate new translations directly from the public domain KJV (King James Version) text using open machine translation models — allowing anyone to freely generate and distribute translations without copyright restrictions.

## 🧱 Project Structure

Each Bible version is stored in its own directory:

```
/<version>/
  ├── bible.json      # Full translated Bible (3D array [book][chapter][verse])
  └── /books/             # One JSON file per book
      ├── genesis.json
      ├── exodus.json
      └── ...
```

The `<version>` name follows this pattern:

```
<SOURCE_VERSION>_<MODEL_NAME_SNAKE_CASE>
```

For example:

```
KJV_HELSINKI_NLP_OPUS_MT_TC_BIG_EN_PT
```

This means:

- Source: KJV (public domain, English)
- Model: Helsinki-NLP/opus-mt-tc-big-en-pt
- Target language: inferred from the model name (en-pt)

## 🛠️ Tools (`tools/`)

OpenBible carries its own command-line tools in a `tools/` npm workspace —
[`bible-crawler`](tools/bible-crawler) (a library that extracts Bible text
from public web pages) and [`bible-dl`](tools/bible-dl) (a CLI to download,
validate, merge and preprocess Bible JSON).

```sh
cd tools
npm install
npm test
```

See [`docs/tools/README.md`](docs/tools/README.md) for usage and
[`docs/tools/provenance.md`](docs/tools/provenance.md) for where the code
came from.

## 🌍 Generating New Translations

Translations are automated through a Jupyter notebook (.ipynb) that:

1. Reads a metadata.json file with the versions to be generated;
2. Checks whether a translated Bible already exists;
3. If not, loads the specified translation model and translates the entire KJV;
4. Saves the result in the corresponding version directory;
5. Splits the translated Bible into per-book JSON files.

### 📝 Example metadata.json

```json
[
  {
    "attribution": "OPUS-MT – Building open translation services for the World and The Tatoeba Translation Challenge – Realistic Data Sets for Low Resource and Multilingual MT",
    "locale": "pt_BR",
    "model": "Helsinki-NLP/opus-mt-tc-big-en-pt",
    "source": [
      "KJV"
    ],
    "version": "KJV_HELSINKI_NLP_OPUS_MT_TC_BIG_EN_PT",
    "language": "Português (Brasil)",
    "url": "https://github.com/churchstudio-org/openbible/raw/main/KJV_HELSINKI_NLP_OPUS_MT_TC_BIG_EN_PT"
  },
  ...
]
```

### 📥 Running the translation notebook (Colab)

You can use Google Colab (T4 GPU) to run the translation process quickly:

1. Run the notebook
2. Download the generated .zip files for each version

## 📚 Data Format

All Bibles use the Open Bible JSON structure:

```json
[
  [ // Book 1 (e.g. Genesis)
    [ "Verse 1:1", "Verse 1:2", ... ],   // Chapter 1
    [ "Verse 2:1", "Verse 2:2", ... ]    // Chapter 2
  ],
  [ // Book 2 (e.g. Exodus)
    ...
  ]
]
```

This three-dimensional array format is:

- Simple to parse;
- Consistent across languages;
- Suitable for indexing, search, or NLP pipelines.

## 🧠 NLP Utilities (Optional)

Some JSON files may include suffixes such as tokens or clean, generated with the [bible-dl](https://github.com/churchstudio-org/bible-dl) tool for NLP preprocessing:

- tokens → Each verse tokenized
- clean → Stopwords removed

```sh
bible-dl tokenize bible.json en   # Outputs bible.tokens.json
bible-dl clean bible.json pt      # Outputs bible.clean.json
```

## ⚠️ Legal Notice & Attribution

The KJV (King James Version) text is public domain worldwide.

Automated translations generated through this project are released under the MIT license.

No proprietary translations are included to avoid copyright violations.

## 🧾 License

This project is licensed under the MIT license.

## 🚀 Roadmap

- [x] Automatic translation pipeline using MarianMT and Hugging Face models
- [x] Per-book JSON generation for lightweight usage
- [ ] Add translation quality evaluation tools
- [ ] Expand to additional source texts (e.g. original Greek/Aramaic)
- [ ] Integrate release automation via GitHub Actions

## 🙌 Contributing

Contributions are welcome! You can add:

- New translation models
- NLP processing tools
- Scripts for release automation
- Documentation improvements

Please open a Pull Request or Issue if you'd like to collaborate.

## ✨ Example Usage

```py
import json

with open("KJV_HELSINKI_NLP_OPUS_MT_TC_BIG_EN_PT/bible.json", "r", encoding="utf-8") as f:
    bible = json.load(f)

# Print Genesis 1:1
print(bible[0][0][0])
```