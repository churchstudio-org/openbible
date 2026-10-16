---
title: Biblia Livre chapter group page
url: https://sites.google.com/site/biblialivre/leia-a-bíblia/gênesis/gênesis-capítulos-1-5
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# Biblia Livre chapter group page

Recorded 2026-10-16. Representative example: the Gênesis chapters 1-5 page at
the `url` above (fetched with `curl`). One page per 5-chapter block of a
split book; the book page's `Capítulos:` list links to these.

## Page identity (source: head meta)

- `og:title` is `Bíblia Livre - Gênesis capítulos 1-5`, i.e.
  `Bíblia Livre - <Book> capítulos <from>-<to>`.

## Verse layout (source: page body)

- The body is a sequence of paragraphs, one per verse:
  `<p dir="ltr" ...><span ...>GEN 1:1 No princípio criou Deus os céus e a
  terra.</span></p>`.
- Each verse line has the format `<ABBREV> <chapter>:<verse> <text>` (e.g.
  `GEN 1:15 E sejam por luminares na expansão dos céus...`).
- `ABBREV` is a 3-letter uppercase book code. Observed: `GEN` (Gênesis),
  `EXO` (Êxodo), `DEU` (Deuteronômio), `JOS` (Josué), `LEV` (Levítico),
  `NUM` (Números) (source: first group pages of the six split books).
- The page holds only its chapter range: the Gênesis 1-5 page runs
  `GEN 1:1` to `GEN 5:32` (138 verses, matching the expected verse count of
  Genesis 1-5); Êxodo 1-5 runs `EXO 1:1` to `EXO 5:23` (123 verses).
- There is no `CAPÍTULO <n>` heading and no book subtitle on group pages
  (unlike single-page books); the chapter is encoded in the verse prefix.
- No `|fn:` footnote lines were found on the Gênesis 1-5 or Êxodo 1-5 group
  pages, but the parser must tolerate them since they occur on single-page
  books.

## Notes for parsing

- Class names (`zfr3Q`, `CDt4Ke`, `C9DxTc`, ...) are obfuscated Google Sites
  classes and unstable; parse by the `dir="ltr"` paragraphs and the
  `<ABBREV> <ch>:<ver> ` text pattern, not by class.
- Verse text ends with a no-break space (`\xa0`) in some lines; trim it.
