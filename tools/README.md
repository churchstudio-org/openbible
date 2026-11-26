# OpenBible tools

The OpenBible ecosystem of tools for fetching, cataloguing and processing
Bible versions in public domain or permissive license.

| Package | License | Description |
| --- | --- | --- |
| [bible-crawler](./bible-crawler/README.md) | MIT | Library that extracts Bible text from public web pages. |
| [bible-dl](./bible-dl/README.md) | MIT | CLI that uses `bible-crawler` to download, validate, merge and preprocess Bible JSON. |

Both packages are members of a single **npm workspace**: `npm install`,
`npm run build`, `npm run lint` and `npm test` run on both at once and resolve
under a single `node_modules` with a single `package-lock.json`.

See the [tools guide](../docs/tools/README.md) for install, build, test and
CLI usage details, the [provenance and licensing](../docs/tools/provenance.md)
page for where the code came from, and the [dependency
audit](../docs/tools/dependency-audit.md) for the full dependency inventory.
