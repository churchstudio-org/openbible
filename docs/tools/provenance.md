# `tools/` provenance and licensing

This directory holds two formerly separate Church Studio projects, now maintained inside
OpenBible as an npm workspace. Their original repositories are to be archived.

## Upstream origin

| Package | Original repository | Original license | Last maintained |
| --- | --- | --- | --- |
| `bible-crawler` | `github.com/churchstudio-org/bible-crawler` | BSD-3-Clause | 2021-08-31 |
| `bible-dl` | `github.com/churchstudio-org/bible-dl` | Unlicense (the `LICENSE` file) while `readme.md` and `package.json` said MIT | 2021-08-21 |

Both were imported as a plain snapshot of the source (no git history) and then
modernized in place: TypeScript moved to the current language level, `tslint`
replaced by ESLint, the unmaintained CLI stack (`gluegun`, `mocha`, `jest 24`)
replaced by `commander` and Node's built-in test runner, and the unmaintained
`natural` and `stopword` packages replaced by small in-house utilities.

## License

Both packages are relicensed to **MIT**, matching OpenBible. The relicense was
approved by the maintainers (plan decision D5 = b), which also resolves the
`bible-dl` discrepancy (its `LICENSE` and its `package.json` disagreed).

- `tools/bible-crawler/LICENSE` — MIT
- `tools/bible-dl/LICENSE` — MIT

The MIT license is compatible with, and may replace, the original
BSD-3-Clause (a superset permissive license) and the Unlicense (public domain)
under either reading of the `bible-dl` metadata. The copyright holder is
recorded as `Codenergy`, consistent with the root `LICENSE`.
