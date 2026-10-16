---
title: Biblia Livre book list page
url: https://sites.google.com/site/biblialivre/leia-a-bíblia
created_at: 2026-10-16T00:02:08+00:00
updated_at: 2026-10-16T00:02:08+00:00
tool: docs/web/tools/fetch-markdown.md
---

# Biblia Livre book list page

Recorded 2026-10-16. Facts below come from the page at the `url` above
(fetched with `curl`); sections name the part of the page each fact comes from.

## What the page is

- The entry page of the "Leia a Bíblia" section of the site; its `og:title`
  (head meta) is `Bíblia Livre - Leia a Bíblia` (source: head meta).
- The site runs on the new Google Sites platform: pages are server-rendered
  HTML, so the content is present in the raw `curl` response without
  executing JavaScript (source: raw HTML of the page).

## Book list (source: page body)

- The body lists all 66 books as links, under the headings
  `Antigo Testamento:` (39 books) and `Novo Testamento:` (27 books), in
  canonical order from `Gênesis` to `Malaquias` and `Mateus` to
  `Apocalipse`.
- Each book link points to the book page
  `https://sites.google.com/site/biblialivre/leia-a-bíblia/<book-slug>`;
  observed slugs include `gênesis`, `êxodo`, `1-samuel`, `1-coríntios`,
  `3-joão`, `apocalipse` (slugs are lowercase Portuguese, accented, with
  `-` where the number meets the name).
- The link elements carry class `XqQF9c`; the same 66 book links also appear
  in the site navigation of every page, where each link has a `data-url`
  attribute holding the same path (source: navigation of the page).

## Notes for parsing

- Google Sites obfuscates most CSS class names (`zfr3Q`, `CDt4Ke`, ...);
  they can change between deployments, so parse by the link text and by the
  `href`/`data-url` path pattern, not by class.
- The `og:description` (head meta) of content pages is truncated to about
  300 characters and is not a reliable full-text source (source: head meta of
  chapter pages).
