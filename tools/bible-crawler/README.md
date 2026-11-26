# bible-crawler

A library to read, extract and store Bible text from public web pages.

Part of the OpenBible [`tools/` workspace](../README.md).

## What it does

Turns a public web page into the `[book][chapter][verse]` JSON array layout
used by OpenBible. Each crawler:

- fetches the current source page,
- parses the verses out of the HTML,
- exposes `title(book, language)`, `read(book, chapter, language)`,
  `readAllChapters(book, language)` and `readAllBooks(language)`.

### Crawlers

| Crawler | Language | Source |
| --- | --- | --- |
| `BibliaLivreCrawler` | `pt_BR` | [Bíblia Livre](https://sites.google.com/site/biblialivre/) |
| `WordProjectCrawler` | `en_US` (KJV), `ja_JP` (Kougo-yaku), `ko_KR` | [WordProject](https://wordproject.org) |

Crawlers are listed and looked up through `CrawlerHelper`.

## Use

```ts
import { WordProjectCrawler, BookOf } from 'bible-crawler';

const crawler = new WordProjectCrawler();
const verses = await crawler.read(BookOf.Genesis, 1, 'en_US');
// ['In the beginning God created the heaven and the earth.', ...]
```

## Develop

```sh
npm run build   # emit dist/
npm run lint    # ESLint
npm test        # Node test runner (offline unit tests)
```

Live-site smoke tests are covered by the test stage's CI job.
See the [tools guide](../../docs/tools/README.md) for the full setup and the
[crawler notes](../../docs/tools/README.md#crawler-notes) for the page-layout
details each crawler depends on.

## License

MIT. See [LICENSE](LICENSE) and [provenance](../../docs/tools/provenance.md).
