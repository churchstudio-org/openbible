---
title: WordProject Japanese Bible chapter page
url: https://www.wordproject.org/bibles/jp/01/1.htm
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# WordProject Japanese Bible chapter page

Recorded 2026-10-16. Representative example: the Japanese Genesis 1 page at
the `url` above (fetched with `curl`), plus spot checks of `01/50.htm`,
`19/150.htm` and `66/22.htm`. Static HTML, no JavaScript needed. This is the
page the `ja_JP` crawler will read.

## URL pattern (source: index page and spot checks)

- Chapter pages live at
  `https://www.wordproject.org/bibles/jp/<NN>/<CH>.htm`, same scheme as the
  English KJV (two-digit book number 01-66, chapter number up to 150).
  Verified: `01/1.htm`, `01/50.htm` (Genesis 50), `19/150.htm` (Psalms 150),
  `66/22.htm` (Revelation 22) all return 200.
- The Bible index is `https://www.wordproject.org/bibles/jp/index.htm`
  (`<title>` "日本語の聖書 - オーディオナレーション付き - Japanese Bible");
  it lists the 66 books in Japanese, each linking to `NN/1.htm`, with the
  English book name in the link `title` attribute (e.g.
  `title="[1] Genesis" href="01/1.htm"`).
- The site's bibles index
  (`https://www.wordproject.org/bibles/index.htm`) labels this edition
  `[Japanese Holy Bible - Kougo-yaku] 日本聖書` (source: that index page).

## Book and chapter header (source: `.textHeader` section)

- The book title is `.textHeader h1`; for Genesis it is ` 創世記` (leading
  space — trim before comparing).
- Chapter links and current-chapter span are the same markup as the English
  KJV pages (`span.chapread`, `a.chap` with `N.htm#0` hrefs).
- The chapter heading is `.textBody h3` (e.g. `第 1 章`).

## Verse layout (source: `.textBody` section)

- Identical structure to the English KJV chapter page: one `<p>` inside
  `<div class="textBody" id="textBody">` holds the whole chapter, verses
  separated by `<br />`, each verse N >= 2 prefixed by
  `<span class="verse" id="N">N </span>`.
- Same quirk: the first verse's number span is commented out
  (`<!--span class="verse" id="1">1 </span-->はじめてに神は天と地とを創造
  された。`), so verse 1 must be taken from the first segment of the `<p>`.
- No footnotes were present on the checked pages.

## Ownership (source: page footer)

- Same footer as the English pages: Wordproject is a registered name of the
  International Biblical Association. See the copyrights page record for
  usage terms.
