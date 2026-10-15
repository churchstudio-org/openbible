---
status: pending
created_at: 2026-10-15T00:00:00-03:00
updated_at: 2026-10-15T00:00:00-03:00
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
   upstream commit and, if subtree was chosen, `git log -- tools/bible-crawler`
   shows the imported history.

2. **Set up package management** as chosen in D2, pinning the Node version and
   TypeScript. Done when a clean install from a fresh clone succeeds and the
   local `bible-crawler` → `bible-dl` link resolves.

3. **Audit dependencies.** Produce an inventory of every direct and transitive
   dependency with maintenance status, license and known vulnerabilities, and
   check install scripts and permissions. Done when the audit is recorded in
   `docs/` and every dependency is classified; any add/remove/upgrade that the
   audit proposes beyond D3 is listed as a new decision.

4. **Apply the dependency upgrades** per D3. Done when `tsc` builds both packages
   and each existing test suite runs without errors.

5. **Fix `BibliaLivreCrawler`** for the current Bíblia Livre page. Done when
   `readAllBooks('pt_BR')` returns all 66 books with the expected chapter/verse
   structure and content matching the committed BLIVRE data.

6. **Remove `Just1WordCrawler`** and handle its languages per D6. Done when the
   crawler and all its references are gone (`rg 'Just1Word|just-1-word'` returns
   nothing) and the chosen replacements pass their checks.

7. **Add and validate English KJV** through `WordProjectCrawler` at
   `wordproject.org/bibles/kj/`. Done when `title` and `read` for the English KJV
   return content matching that site for sampled books and chapters.

8. **Add tests** per D4. Done when an offline test suite passes deterministically
   and the live smoke tests are opt-in and documented.

9. **Document the tools.** Add a page under `docs/` for `tools/`, update the
   `docs/README.md` index, and update the root `README.md` to point at it. Done
   when the docs describe what each tool is, how to install, build and test it,
   and how to run the crawlers.

10. **Verify the whole.** Done when a single documented command from `tools/`
    builds, lints and tests both packages successfully.

## Out of scope

- Rewriting or extending the crawlers beyond the fixes named above (new sources,
  full language coverage).
- Publishing either package to npm.
- Changing OpenBible's JSON data format or the existing data directories.
- Translating Bible versions or changing the translation pipeline.
- Release automation or other CI work from the README roadmap.
- Migrating the archived repositories' issues, pull requests or other metadata.
