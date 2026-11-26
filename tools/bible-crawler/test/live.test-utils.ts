import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchText } from '../src';

// Live smoke tests are opt-in: `OPENBIBLE_LIVE=1 npm test` runs them (CI does
// this); everywhere else the `node --test` suite reports them as skipped.
//
// They exercise the crawlers against the live sites recorded under
// `docs/web/`, so a real page change or a third-party outage shows up in the
// log. Per the routing brief, third-party instability must never drop the CI
// build, so every fetch uses a timeout and bounded retries, and the CI job
// that runs the live tests is non-blocking (`continue-on-error`). A failure
// therefore reads as a visible, non-blocking check — not as a build break —
// while the deterministic offline unit tests remain the gate for the
// crawlers' own behavior.
//
// The contract is documented in `docs/tools/README.md` ("Live smoke tests").

export const isLive = process.env.OPENBIBLE_LIVE === '1';

export const live = isLive ? test : test.skip;

const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_BACKOFF_MS = 2_500;
const MAX_RETRIES = 3;

async function sleep(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Fetch a URL with a per-request timeout and bounded retries; throws a clear
// error once the retries are exhausted (a transient third-party outage).
export async function withRetry(url: string): Promise<string> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const backoff = RETRY_BACKOFF_MS * (2 ** (attempt - 1));
            console.log(`[live] retry ${attempt}/${MAX_RETRIES} (${backoff} ms) for ${url}`);
            await sleep(backoff);
        }

        try {
            return await fetchText(url, { timeoutMs: REQUEST_TIMEOUT_MS });
        } catch (error) {
            lastError = error;
            console.warn(
                `[live] GET ${url} attempt ${attempt + 1}/${MAX_RETRIES + 1} failed: ` +
                `${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    throw new Error(
        `gave up on ${url} after ${MAX_RETRIES + 1} attempt(s): ` +
        `${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
}

// Assert that a live-crawled sample matches the committed reference it was
// built from (verse count and first verse). The failure message names the
// third-party-drift nature so the non-blocking CI job is read correctly.
export function assertLiveSample(
    label: string,
    verses: string[],
    expected: { verses: number; first: string },
): void {
    const countOk = verses.length === expected.verses;
    const firstOk =
        countOk && (verses[0] ?? '').replace(/\s+/g, ' ').trim().startsWith(expected.first);

    assert.ok(
        countOk && firstOk,
        `${label}: expected ${expected.verses} verses starting with "${expected.first}", ` +
        `got ${verses.length} verse(s)` +
        (verses[0] ? `; first was "${verses[0].slice(0, 60)}…"` : '') +
        ` — third-party drift; see docs/web/`,
    );
}
