---
title: WordProject English KJV chapter page
url: https://www.wordproject.org/bibles/kj/01/1.htm
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# WordProject English KJV chapter page

Recorded 2026-10-16. Representative example: the English KJV Genesis 1 page
at the `url` above (fetched with `curl`), plus spot checks of
`01/2.htm`, `66/22.htm` and the index page. The page is static HTML
(`text/html; charset=utf-8`, HTTP 200), no JavaScript needed.

## URL pattern (source: index page and spot checks)

- Chapter pages live at
  `https://www.wordproject.org/bibles/kj/<NN>/<CH>.htm`, where `NN` is the
  two-digit book number (01-66, canonical book order) and `CH` the chapter
  number (up to 150). Verified: `01/1.htm` (Genesis 1), `01/2.htm`,
  `66/22.htm` (Revelation 22) all return 200.
- The Bible index is `https://www.wordproject.org/bibles/kj/index.htm`
  (`<title>` "The Holy Bible in the English language with audio narration -
  KJV"); it lists the 66 books with one link each to `NN/1.htm` (e.g.
  Genesis -> `01/1.htm`).
- The edition is the King James Version (source: index page heading
  `[King James Version]`).

## Book and chapter header (source: `.textHeader` section)

- The book title is `.textHeader h1` (e.g. `Genesis`).
- Below it, the current chapter is `<span class="chapread">1</span>` and the
  other chapters are links `<a class="chap" href="2.htm#0">2</a>` ... so
  chapter `N` is at `N.htm` inside the book directory.
- The chapter heading in the text area is `.textBody h3` (e.g. `Chapter 1`).

## Verse layout (source: `.textBody` section)

- `<div class="textBody" id="textBody">` holds an `<h3>`, an empty
  `<span class="dimver">`, then a **single** `<p>` containing the whole
  chapter; verses are separated by `<br />`.
- Each verse N >= 2 is prefixed by
  `<span class="verse" id="N">N </span>` (e.g.
  `<br /><span class="verse" id="2">2 </span>And the earth was without
  form...`).
- **Quirk:** the first verse of each page has its number span commented out:
  `<!--span class="verse" id="1">1 </span-->In the beginning God created
  the heaven and the earth.` (observed on `01/1.htm` and `01/2.htm`). A
  parser that only collects `span.verse` elements will miss verse 1 and must
  also process the first segment of the `<p>`.
- Verse text is plain text inside the `<p>`; no footnotes are present on the
  checked pages.

## Ownership (source: page footer)

- The footer states `Wordproject` is a registered name of the International
  Biblical Association, a non-profit organization. See the copyrights page
  record for usage terms.
