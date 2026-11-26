# Dependency audit (tools/)

Date: 2026-11-26. This inventory records every dependency of `tools/bible-crawler`
and `tools/bible-dl` at the time of import, its license, and its maintenance
status. It is the deliverable of plan step 3, and the reference for any add,
remove or upgrade made against the approved decision (D3 = b, full
modernization).

All versions are pinned exactly in the `package.json` files and resolved to
exact versions in `tools/package-lock.json`.

## Runtime (production) dependencies

| Package | Version | License | Purpose | Status |
| --- | --- | --- | --- | --- |
| `node-html-parser` (bible-crawler) | 9.0.7 | MIT | Parses the HTML of the crawled pages (`parse`, `querySelector`). No install scripts. | Maintained, current major. Replaces `cross-fetch` (no longer needed — Node 20 ships global `fetch`). |
| `commander` (bible-dl) | 14.0.3 | MIT | Command line parsing for the `bible-dl` CLI. No install scripts. | Maintained, current major. Replaces the unmaintained `gluegun` CLI stack (which also brought `ora`, `prompts`, `inquirer`, `listr2`, `ejs`, ...). |
| `bible-crawler` (bible-dl) | workspace `*` | MIT | The crawler engine the CLI drives. Local workspace link, no network package. | Local package in this repository. |

The original `bible-dl` also depended on `natural@5` and `stopword@1`. Both were
unmaintained and not required for the repository's goals (crawl, validate,
merge, compare), so they were **removed** and a small in-house lexer
(`bible-dl/src/utils/lexer.ts`) now tokenizes and strips stopwords for `en`
and `pt`. This is the "small need — prefer a small in-house implementation"
policy in the working rules.

## Development dependencies

| Package | Version | License | Purpose |
| --- | --- | --- | --- |
| `typescript` | 5.9.3 | Apache-2.0 | Compiler. Bumped from `3.6` / `4.3` to the current 5.x LTS-major line. |
| `tsx` | 4.20.3 | MIT | Runs TypeScript tests and the developer CLI directly (no separate compile step for tests). Pulls `esbuild` (MIT) as a runtime helper. |
| `eslint` | 9.39.2 | MIT | Linter. Replaces `tslint` (5.x, deprecated). |
| `@eslint/js` | 9.39.2 | MIT | Recommended base ESLint configuration. |
| `typescript-eslint` | 8.74.0 | MIT | ESLint plugin for TypeScript. Pinned past 8.72.2 to pull in the fixed `@typescript-eslint/typescript-estree` (transitive moderate CVE via `minimatch`; 8.49.0 was affected). |
| `prettier` | 3.6.2 | MIT | Optional code formatter (`npm run format`). |
| `@types/node` | 24.10.1 | MIT | Node typings. |

## Removed from the upstream projects

| Removed | Was | Why |
| --- | --- | --- |
| `cross-fetch@3` | fetch polyfill for Node < 18 | Replaced by Node 20's global `fetch`. |
| `tslint + tslint-config-standard + tslint-config-prettier` | Linter | `tslint` is deprecated; ESLint + `typescript-eslint` replace it (D3 = b). |
| `gluegun` (unpinned) | CLI framework | Unpinned `latest` and unmaintained; `commander` is sufficient (D3 = b). |
| `ora` | Spinner | Was only used by the gluegun download flow. |
| `natural@5` | Tokenizer (en/ja/pt) | Unmaintained, not required; removed (in-house lexer). |
| `stopword@1` | Stopword lists | Unmaintained, not required; removed (in-house lexer). |
| `mocha`, `chai`, `mocha-each`, `ts-node`, `ts-node-dev`, `jest 24`, `ts-jest 24` | Test runners | Replaced by Node's built-in `node --test` runner (no dependency). |

## Install scripts and permissions

- `tsx` pulls `esbuild`, whose `postinstall` runs `node install.js` to pick a
  matching binary build. `npm` currently gates this behind an `allowScripts`
  review (see the install output during `npm install`). No source is piped
  from the network.
- No other dependency runs an install script or asks for extra permissions.

## Transitive dependencies

See `tools/package-lock.json` for the full tree. The only transitive runtime
dependency of the production code is `node-html-parser`'s (a small selector
engine); `commander` is a leaf. Everything else is dev-only (TypeScript,
ESLint, Prettier, tsx/esbuild).

## Vulnerabilities

- `npm audit --omit=dev` (runtime set: `node-html-parser`, `commander`) reports
  **0** vulnerabilities.
- `npm audit` (prod + dev) reports one finding: a moderate `minimatch` issue
  reachable through `@typescript-eslint/typescript-estree` 6.16.0 – 8.72.2 in
  the *dev-only* `typescript-eslint` chain. Pinning `typescript-eslint` to
  **8.74.0** (already done) resolves it; 8.73.0 or later would as well.
- No high or critical finding applies to the runtime set.
- Any future `npm audit` failure must be reported before merging.
