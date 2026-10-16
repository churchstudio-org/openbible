---
title: Biblia Livre book page with inline verses
url: https://sites.google.com/site/biblialivre/leia-a-bíblia/filemom
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# Biblia Livre book page with inline verses

Recorded 2026-10-16. Representative example: the Filemom book page at the
`url` above (fetched with `curl`). Books that are not split into groups hold
their entire text on the book page: Filemom (1 chapter), Lucas (24
chapters), Salmos (150 chapters on a single ~842 KB page), João, Apocalipse,
Judas (source: bodies of the respective book pages).

## Page identity (source: head meta, page body)

- `og:title` is `Bíblia Livre - Filemom` (i.e. `Bíblia Livre - <Book>`).
- The book title is the centered `<h1>` in the body (e.g. `Filemom`).
- Such book pages have no `Capítulos:` list and no group links (source:
  page body), which is how they are distinguished from split books.

## Verse layout (source: page body)

The body is a sequence of paragraphs, one per line, in this order:

1. An optional book subtitle line, e.g. `Carta de Paulo a Filemom`
   (Filemom), `Evangelho Segundo Lucas` (Lucas).
2. A chapter heading in the form `CAPÍTULO <n>` (all caps, source: body).
3. Verses in the form `<verse-number> <text>`, numbered per chapter
   (e.g. `1 Paulo, prisioneiro de Cristo Jesus, e o irmão Timóteo, a
   Filemom, o amado, e nosso cooperador;`). The chapter of a verse is the
   most recent `CAPÍTULO` heading above it.
4. Footnote lines in the form `|fn: <footnote text>`, interleaved with the
   verses they annotate; the anchored verse text contains a marker such as
   `[que está]` and resumes after the footnote block (e.g. verse 2 ends
   `[que está]`, a `|fn: N4: irmã` line follows, then verse 3 resumes with
   `3 Haja]`). Lucas has 29 such lines and Salmos 8 (source: bodies).

## Notes for parsing

- Class names are obfuscated Google Sites classes and unstable; parse by the
  `dir="ltr"` paragraphs and the text patterns above, not by class.
- Some lines end with a no-break space (`\xa0`); trim it.
