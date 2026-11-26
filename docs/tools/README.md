# Tools

`tools/` holds the OpenBible command-line tooling, managed as a single
**npm workspace**:

- **`bible-crawler`** — a library that extracts Bible text from public web
  pages. Crawlers currently in use:
  - `BibliaLivreCrawler` — `pt_BR` from [Bíblia Livre]
  - `WordProjectCrawler` — `en_US` (King James Version), `ja_JP` (Kougo-yaku)
    and `ko_KR` from [WordProject]
- **`bible-dl`** — a `commander`-based CLI that uses `bible-crawler` as its
  engine to download, validate, merge and preprocess Bible JSON.

They were imported from the now-archived `bible-crawler` and `bible-dl`
repositories, as a plain source snapshot. See [provenance and
licensing](provenance.md) for the origin, the original licenses and the MIT
relicense, and the [dependency audit](dependency-audit.md) for the full
inventory of dependencies introduced or changed.

## Requirements

- Node.js 20+ (an LTS line).
- `npm` 10+.

## Install

From the repository root:

```sh
cd tools
npm install
```

This installs both workspaces and their dependencies under a single
`tools/node_modules` directory and a single `tools/package-lock.json`.
`node_modules/` is ignored by git.

## Build, lint, test

Both packages expose the same three tasks; from `tools/`:

```sh
npm run build           # compile TypeScript to dist/ for both workspaces
npm run lint            # run ESLint on both workspaces
npm test                # run Node's built-in test runner on both workspaces
```

Or one command that builds, lints and tests them together:

```sh
npm run test && npm run lint && npm run build
```

`bible-dl`'s scripts already depend on the `bible-crawler` build (`prebuild`,
`pretest`), so `npm test` on its own is sufficient.

## Running the CLI

`bible-dl` runs directly from TypeScript via the `tsx` loader, so no build step
is strictly required to use it.

```
bible-dl --help
bible-dl books [--json]
bible-dl crawlers
bible-dl download --crawler WordProject --language en_US --book Genesis [--chapter 1] [-o out]
bible-dl download --crawler BibliaLivre --language pt_BR --book Filemom [-o out]
bible-dl validate path/to/bible.json
bible-dl merge path/to/books/
bible-dl clean --language en path/to/genesis.json
bible-dl diff path/a/bible.json path/b/bible.json
```

Output files use the `[book]` array (chapters) and `[book][chapter]` array
(verses) layout of the root `<version>/bible.json` files.

## Crawler notes

### `BibliaLivreCrawler` (pt_BR)

Bíblia Livre is served from the current Google Sites platform. Two layouts are
in use:

- **split books** (e.g. Gênesis, Êxodo, Levítico, Números, Deuteronômio, Josué)
  hold a `Capítulos:` list on the book page and link to chapter-group
  subpages (one per 5-chapter block); each group page is a sequence of
  `<p dir="ltr">` paragraphs in the form `<ABBREV> <chapter>:<verse> <text>`.
- **single-page books** (e.g. Filemom, Lucas, Salmos, João, Apocalipse,
  Judas) hold all verses inline, separated by `CAPÍTULO <n>` headings. Verse
  lines start with a number, and footnote lines start with `|fn:`.

Both layouts are detected per book: if the page has own chapter-group links
(`/<slug>/<slug>...`) the split parser is used; otherwise the inline parser
is used. Class names from Google Sites are obfuscated and change between
deployments, so the parsers rely on the `dir="ltr"` paragraphs and on
`<ABBREV> <chapter>:<verse> <text>` / `CAPÍTULO <n>` patterns.

Recorded page structure: [`docs/web/biblia-livre/`](../web/biblia-livre/).

### `WordProjectCrawler` (en_US / ja_JP / ko_KR)

WordProject serves static HTML at `https://www.wordproject.org/bibles/<code>/<NN>/<CH>.htm`. Each chapter is a single `<p>` inside `.textBody`, with verses separated
by `<br />` and verses 2+ prefixed by `<span class="verse" id="N">N </span>`.
The first verse's number span is commented out
(`<!--span class="verse" id="1">1 </span-->`), so the parser keeps the first
text segment explicitly.

Recorded page structure: [`docs/web/wordproject/`](../web/wordproject/).

## Out of scope

- Publishing either package to npm.
- Adding new languages or new crawlers.
- Changing OpenBible's JSON data format.

[Bíblia Livre]: https://sites.google.com/site/biblialivre/
[WordProject]: https://www.wordproject.org/
