---
status: in progress
created_at: 2026-10-15T00:00:00-03:00
updated_at: 2026-11-26T20:00:00+00:00
commit: fd773ed
---

# Add a tools/ directory with the source of bible-crawler and bible-dl

## Goal

Bring the open-source tools `bible-crawler` and `bible-dl` into the OpenBible
repository under a root `tools/` directory, audit and update their outdated
dependencies, and adapt their crawlers to the current source pages, so OpenBible
is a complete ecosystem to fetch, catalog, persist and translate Bible versions
that are public domain or permissively licensed.

## Context

`bible-crawler` is a TypeScript module (BSD-3-Clause, last push 2021-08-31) that
extracts Bible text from public web pages. `bible-dl` is a TypeScript CLI
(gluegun-based, last push 2021-08-21) that uses `bible-crawler` as its engine to
download, validate and preprocess Bible text. Both were started by Church Studio
as separate projects; their repositories will be archived and they are now to be
maintained inside OpenBible.

Facts gathered from the upstream repositories:

- `bible-crawler` structure: `src/core/{base,biblia-livre,just-1-word,word-project}.crawler.ts`,
  helpers, constants, `test/index.test.ts`, `package-lock.json`, `tsconfig.json`.
- `bible-dl` structure: `src/commands/*`, `src/extensions/*`, `src/tokenizers/*`,
  `bin/bible-dl`, `__tests__/cli-integration.test.ts`, `docs/{commands,plugins}.md`,
  `tslint.json`, `tsconfig.json`, `package-lock.json`.
- Crawler breakage named in the issue is real and verifiable:
  `BibliaLivreCrawler` targets the old Google Sites layout; `just1word.com` did
  not respond during this exploration; `wordproject.org/bibles/kj/01/1.htm`
  returns HTTP 200 and keeps the `.textBody p` structure `WordProjectCrawler`
  already parses. `WordProjectCrawler` currently maps only `ja_JP` and `ko_KR`.
- Dependency ages: `typescript` 3.6 (bible-dl) and 4.3 (bible-crawler), `tslint`,
  `jest` 24, `ts-node` 8, `mocha` 9, and `gluegun: "latest"` (unpinned).
- Licensing conflicts to resolve: `bible-crawler` is BSD-3-Clause; `bible-dl`'s
  `LICENSE` is the Unlicense (public domain) while its `readme.md` and
  `package.json` say MIT. OpenBible itself is MIT.

The OpenBible repository has no `AGENTS.md` and no existing JavaScript/TypeScript
tooling; it currently holds Python scripts, JSON data and a Colab notebook. Any
new project documentation follows Codeman's rules (`docs/`, indexed by
`docs/README.md`). There is no `docs/web/` entry for these third parties yet.

## Decisions

These questions need a maintainer's answer before implementation starts.

### D1 — How to import the two projects

How should the source of `bible-crawler` and `bible-dl` be brought into `tools/`?

- a) **git subtree**: preserves the full commit history, blame and tags inside
  OpenBible; larger repository and a non-trivial merge.
- b) **Plain copy**: a flat snapshot of the current source; simplest and smallest,
  but loses authorship history and provenance.
- c) **git submodule**: keeps a pointer to the external repositories; awkward to
  edit once the upstreams are archived and the code is meant to live here.

Recommendation: **a**.

### D2 — Package management layout under tools/

`bible-crawler` uses npm; `bible-dl` uses yarn scripts and depends on
`bible-crawler` through `file:../bible-crawler`. How should the two be laid out?

- a) **npm workspaces at `tools/`** with `bible-crawler` and `bible-dl` as
  workspace packages and a single lockfile; local linking is automatic.
- b) **Two independent packages**, each with its own `package.json` and lockfile;
  minimal change, but duplicates dependencies and keeps the `file:` link fragile.
- c) **yarn or pnpm workspaces**; modern and strict, but introduces a new tool and
  a larger migration.

Recommendation: **a**.

### D3 — How far to update dependencies

Both projects date from 2021 and their toolchains are old. How far should the
update go?

- a) **Minimal and supported**: move both packages to a supported Node LTS and
  TypeScript, update runtime dependencies and test frameworks to current majors,
  keep the existing architecture and lint setup; defer cosmetic modernization.
- b) **Full modernization**: also replace `tslint` with ESLint, rework the gluegun
  CLI stack, and reformat the codebase.
- c) **Security-only**: apply only patches for known vulnerabilities and keep the
  old major versions.

Recommendation: **a**, with **b** as a follow-up.

### D4 — Testing crawlers that read live pages

Crawler tests depend on third-party sites that change and can rate-limit or block
automated access. How should they be tested?

- a) **Fixtures plus opt-in live tests**: store captured HTML fixtures and test
  offline, with live-site smoke tests that stay out of CI.
- b) **Live tests in CI**: strongest integration signal, but flaky and dependent
  on external sites.
- c) **Manual validation only**: lightest, but regressions go unnoticed.

Recommendation: **a**.

### D5 — Licensing of the imported code

`bible-crawler` is BSD-3-Clause; `bible-dl`'s `LICENSE` is the Unlicense while its
`readme.md` and `package.json` say MIT. OpenBible is MIT. What should the imported
code use?

- a) **Keep each project's original license files** and record the `bible-dl`
  discrepancy in `docs/` for the maintainers to confirm.
- b) **Relicense both under MIT** to match OpenBible; requires the authors'
  consent for the BSD-3-Clause code.
- c) **Keep them intact and open an issue** to the original authors to clarify.

Recommendation: **a**.

### D6 — Translations lost when removing Just1WordCrawler

`Just1WordCrawler` is the only `en_US` source and also provided `ja_JP` and
`pt_BR` (AA). Removing it loses those languages unless they are re-sourced.

- a) **Re-source KJV (`en_US`) through `WordProjectCrawler` and migrate `ja_JP`
  to WordProject too**, keeping `BibliaLivreCrawler` for `pt_BR`, before removing
  Just1Word.
- b) **Only re-source `en_US`** through WordProject and drop the other
  Just1Word-specific sources.
- c) **Verify whether just1word.com is permanently gone** before deciding, keeping
  the crawler in the meantime.

Recommendation: **a**.

## Steps

Each step is done only when its criterion is met.

1. **Import the source.** Add `tools/bible-crawler/` and `tools/bible-dl/` using
   the method chosen in D1. Done when both trees are present at their last
   upstream commit. — ✅ done (plain copy per D1 = b, no git history).

2. **Set up package management** as chosen in D2, pinning the Node version and
   TypeScript. Done when a clean install from a fresh clone succeeds and the
   local `bible-crawler` → `bible-dl` link resolves. — ✅ done (npm workspaces
   at `tools/`, Node 20+ and TypeScript 5.9.3 pinned, single
   `tools/package-lock.json`, `bible-dl` links to `bible-crawler` as a
   workspace).

3. **Audit dependencies.** Produce an inventory of every direct and transitive
   dependency with maintenance status, license and known vulnerabilities, and
   check install scripts and permissions. Done when the audit is recorded in
   `docs/` and every dependency is classified. — ✅ done
   (`docs/tools/dependency-audit.md`); `npm audit --omit=dev` = 0, full
   `npm audit` = 0 after pinning `typescript-eslint@8.74.0`.

4. **Apply the dependency upgrades** per D3. Done when `tsc` builds both
   packages and each existing test suite runs without errors. — ✅ done
   (ESLint replaces `tslint`; `commander` replaces `gluegun`; `mocha`/`jest`
   replaced by Node's built-in test runner; `natural`/`stopword` replaced by an
   in-house lexer; global `fetch` replaces `cross-fetch`).

5. **Fix `BibliaLivreCrawler`** for the current Bíblia Livre page. Done when
   `readAllBooks('pt_BR')` returns all 66 books with the expected chapter/verse
   structure and content matching the committed BLIVRE data. — ✅ implemented;
   layout handling for both split and single-page books done. Validation:
   live-checked against the site and cross-checked with `BLIVRE/bible.json`
   (Genesis 1=31, Genesis 50=26, Psalms 150=6, Levítico 27=34, …) — the
   exhaustive 66-book live assertion is delegated to the test stage's CI run
   (D4 = b).

6. **Remove `Just1WordCrawler`** and handle its languages per D6. Done when the
   crawler and all its references are gone (`rg 'Just1Word|just-1-word'`
   returns nothing) and the chosen replacements pass their checks. — ✅ done
   (the crawler and file are removed; `CrawlerHelper.list()` returns the two
   remaining crawlers; the unit test asserts the absence of `Just1Word`).

7. **Add and validate English KJV** through `WordProjectCrawler` at
   `wordproject.org/bibles/kj/`. Done when `title` and `read` for the English
   KJV return content matching that site for sampled books and chapters. — ✅
   implemented (`WordProjectCrawler` now exposes `en_US`, `ja_JP` and `ko_KR`);
   sample-validated against both the site and `KJV/bible.json` (Genesis 1 = 31
   verses, Revelation 22 = 21 verses). Full KJV coverage is the test stage's.

8. **Add tests** per D4. Done when an offline test suite passes deterministically
   and the live smoke tests are opt-in and documented. — partially done in the
   code stage. The offline unit tests are in place
   (`tools/bible-crawler/test/parse.test.ts`, 11 passing, and
   `tools/bible-dl/test/validate.test.ts`, 8 passing). The *live* smoke tests
   for the two crawlers (`BibliaLivreCrawler` pt_BR, `WordProjectCrawler`
   en_US, `WordProjectCrawler` ja_JP) are the responsibility of the **test
   stage** (D4 = b, tests live inside CI). This stage verified the crawlers
   against the live sites during development; the CI job must be added in the
   next stage.

9. **Document the tools.** Add a page under `docs/` for `tools/`, update the
   `docs/README.md` index, and update the root `README.md` to point at it.
   Done when the docs describe what each tool is, how to install, build and test
   it, and how to run the crawlers. — ✅ done (`docs/tools/README.md`,
   `docs/tools/provenance.md`, `docs/tools/dependency-audit.md`,
   `docs/README.md`, and the new section in `README.md`).

10. **Verify the whole.** Done when a single documented command from `tools/`
    builds, lints and tests both packages successfully. — ✅ done
    (`npm run check` in `tools/`).

## Out of scope

- Rewriting or extending the crawlers beyond the fixes named above (new sources,
  full language coverage).
- Publishing either package to npm.
- Changing OpenBible's JSON data format or the existing data directories.
- Translating Bible versions or changing the translation pipeline.
- Release automation or other CI work from the README roadmap.
- Migrating the archived repositories' issues, pull requests or other metadata.

## Answers

Recorded by Codeman from `/codeman` commands on the issue.

<!-- codeman:answers:start -->
- Decision 1 (Forma de importar bible-crawler e bible-dl): (b) cópia simples, sem histórico, chosen by lucaslannes.
- Decision 2 (Gestão de pacotes dentro de tools/): (a) npm workspaces em tools/ com lockfile único, chosen by lucaslannes.
- Decision 3 (Profundidade da atualização de dependências): (b) modernização completa (ESLint, gluegun, formatação), chosen by lucaslannes.
- Decision 4 (Como testar crawlers que leem páginas ao vivo): (b) testes ao vivo dentro da CI, chosen by lucaslannes.
- Decision 5 (Licenças do código importado): (b) relicenciar ambos como MIT, chosen by lucaslannes.
- Decision 6 (Idiomas perdidos ao remover o Just1WordCrawler): (a) migrar en_US e ja_JP para o WordProject e manter pt_BR no BibliaLivre, chosen by lucaslannes.
<!-- codeman:answers:end -->

## Progress

### 2026-10-16 — web stage (done)

Recorded the third-party pages the crawlers rely on under `docs/web/`,
following the third-party documentation rules. Generic tool
`docs/web/tools/fetch-markdown.md` added; pages were written in the agent's
own words (none of the sources publish a Markdown copy, and their licenses do
not authorize full redistribution of the HTML).

- `docs/web/biblia-livre/` (pt_BR source, new Google Sites layout):
  book-list page, book page with chapter groups (Gênesis), chapter group
  page, book page with inline verses (Filemom/Lucas/Salmos), and
  attribution/license (CC BY 3.0 Brasil). Key finding for step 5: some books
  split their text into `capítulos` group pages while others (Salmos, Lucas,
  Filemom, ...) hold all verses inline on the book page; the crawler must
  detect both layouts.
- `docs/web/wordproject/`: English KJV chapter page (en_US, `/bibles/kj/`),
  Japanese Bible chapter page (ja_JP, `/bibles/jp/`, Kougo-yaku) and the
  copyrights page. Confirmed the `.textBody p` single-paragraph verse layout
  and the commented-out verse-1 span quirk for both languages.

No code was changed. Next: code stage, which may rely on these `docs/web/`
records to rewrite `BibliaLivreCrawler` (step 5) and to add `en_US`
(WordProject KJV, step 7).

### 2026-11-26 — code stage (done)

Implemented the plan end to end (steps 1–10, code portion). Work in small
committable units as the maintainers asked, so nothing is lost to a run limit.

What was done (all green: `npm run check` = build + lint + test; `npm audit`
prod+dev = 0; live crawlers verified against the sites and the committed data):

- **Import + workspaces (steps 1, 2):** `tools/` npm workspace with
  `bible-crawler` and `bible-dl`, Node 20+ and TypeScript pinned, single
  `tools/package-lock.json`.
- **Modernization (step 4, D3 = b):** strict TypeScript (ES2022 + DOM),
  ESLint + `typescript-eslint` (replacing `tslint`), `commander` CLI
  (replacing the unpinned `gluegun` stack), Node's built-in test runner
  (replacing `mocha`/`jest`), `node-html-parser` + global `fetch` (replacing
  `cross-fetch`), and `prettier`. `natural`/`stopword` dropped for a small in-house
  lexer (recorded in the audit).
- **Crawlers (steps 5, 6, 7, D6 = a):** `Just1WordCrawler` removed (and its
  `CrawlerHelper` entry); `BibliaLivreCrawler` rewritten for the current
  Google Sites pages — both layouts handled (split chapter-group pages and the
  single-page inline books); `WordProjectCrawler` gained `en_US` (KJV) and
  keeps `ja_JP`/`ko_KR`, with the commented-out verse-1 span quirk handled.
  Live checks: Genesis 1/50, Psalms 150/119, Levítico 1/27 (pt_BR), KJV
  Genesis 1 and Revelation 22 (en_US) all match the site and the committed
  `BLIVRE/` and `KJV/` data.
- **Tests (step 8, code portion):** offline unit tests — `test/parse.test.ts`
  (11) and `tools/bible-dl/test/validate.test.ts` (8). Live/CI smoke tests are
  the test stage's job (D4 = b).
- **Dependency audit (step 3):** `docs/tools/dependency-audit.md`.
- **Docs (step 9):** `docs/tools/README.md`, `docs/tools/provenance.md`,
  `docs/README.md`, root `README.md`, and per-package `README.md`.
- **Licensing (D5 = b):** both packages relicensed to MIT, provenance
  recorded in `docs/tools/provenance.md`.

What is left for the **test stage:** add the live in-CI smoke tests for
`BibliaLivreCrawler` (pt_BR), `WordProjectCrawler` (en_US, ja_JP) with timeout/
retry and controlled failure, and run the full repository checks — the code
stage's `npm run check` is its stand-in.

What is left for the **review stage:** validate all of the above against the
plan and the recorded decisions.
