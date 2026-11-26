# bible-dl

A command line tool to download, validate, merge and preprocess Bible text,
using [`bible-crawler`](../bible-crawler/README.md) as its engine.

Part of the OpenBible [`tools/` workspace](../README.md).

## Commands

| Command | Description |
| --- | --- |
| `bible-dl books` | List the 66 Bible books. |
| `bible-dl crawlers` | List the available crawlers and their languages. |
| `bible-dl download` | Download a book/chapter from a crawler to JSON. |
| `bible-dl validate` | Validate a `bible.json` (66 books, 1189 chapters, ~30000 verses). |
| `bible-dl merge` | Merge `<book>.json` files into a single `bible.json`. |
| `bible-dl clean` | Remove stopwords from a verse array, given a language code. |
| `bible-dl diff` | Compare two `bible.json` files and report per-book differences. |

Run any command with `--help` for its options.

## Examples

```sh
# List books and crawlers.
bible-dl books
bible-dl crawlers

# Download a single chapter (KJV English).
bible-dl download --crawler WordProject --language en_US --book Genesis --chapter 1 -o out

# Download a whole book (Biblia Livre Portuguese).
bible-dl download --crawler BibliaLivre --language pt_BR --book Filemom -o out

# Validate a full bible.json.
bible-dl validate out/bible.json

# Merge per-book files into one bible.json.
bible-dl merge out

# Strip stopwords from a chapter file (English).
bible-dl clean --language en out/genesis_1.json
```

## Output format

The files use the same layout as OpenBible's `<version>/bible.json`:

- a **book** file is an array of chapters, each an array of verses;
- a **chapter** file is an array of verse strings.

## Develop

```sh
npm run build   # emit dist/
npm run lint    # ESLint
npm test        # Node test runner
```

The CLI runs straight from TypeScript (via `tsx`), so a build is optional for
development but required for the `dist/` artifacts.

## License

MIT. See [LICENSE](LICENSE) and [provenance](../../docs/tools/provenance.md).
