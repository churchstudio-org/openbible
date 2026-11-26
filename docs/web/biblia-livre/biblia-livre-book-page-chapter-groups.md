---
title: Biblia Livre book page (chapter groups)
url: https://sites.google.com/site/biblialivre/leia-a-bíblia/gênesis
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# Biblia Livre book page (chapter groups)

Recorded 2026-10-16. Representative example: the Gênesis book page at the
`url` above (fetched with `curl`). Some books are split into chapter-group
subpages; this is the book page of one of them.

## Page identity (source: head meta)

- `og:title` is `Bíblia Livre - Gênesis`, i.e. `Bíblia Livre - <Book>`.
- The book title also appears as the centered `<h1>` in the page body
  (e.g. `Gênesis`).

## Chapter-group links (source: page body)

- After the `<h1>`, the body has a `Capítulos:` paragraph followed by a
  `<ul>` list; each `<li>` holds one link (class `XqQF9c`) to a chapter-group
  page, with the link text being the chapter range (`1-5`, `6-10`, ...).
- For Gênesis there are 10 groups covering chapters 1-50 in blocks of five
  (`1-5` ... `46-50`).
- The group-page path is
  `/site/biblialivre/leia-a-bíblia/<book-slug>/<book-slug>-capítulos-<from>-<to>`,
  e.g. `.../gênesis/gênesis-capítulos-1-5`. The last group may be shorter
  (e.g. Levítico ends `26-27`; Números has a single-chapter group
  `números-capítulo-36`, and one malformed link `levítico-16-20` missing the
  `capítulos` word).
- **Important:** the book page itself contains no verse text for these books;
  the verses live on the chapter-group pages. A crawler must follow the
  group links. (Contrast with single-page books, which hold all verses inline
  on the book page.)

## Which books are split

- Observed split books (their book page lists group links instead of verses):
  Gênesis, Êxodo, Deuteronômio, Josué, Levítico, Números.
- Observed single-page books (all verses inline, no group links): Filemom,
  Lucas, Salmos, João, Apocalipse, Judas. The split is a site design choice,
  not driven by chapter count (Salmos has 150 chapters but is inline). A
  crawler must detect the two layouts per book.

## Notes for parsing

- Class names are obfuscated by Google Sites and unstable; parse by the
  `href`/`data-url` path pattern and by `Capítulos:` / link text, not by
  class.
