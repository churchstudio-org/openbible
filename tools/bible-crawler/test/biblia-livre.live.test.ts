import assert from 'node:assert/strict';

import { BookOf, BookTitle, BibliaLivreCrawler, ChaptersOf } from '../src';
import { assertLiveSample, live, withRetry } from './live.test-utils';

const titleOf = (book: BookOf): BookTitle => BookOf[book] as BookTitle;

// Live smoke tests against the Bíblia Livre site (pt_BR), recorded under
// `docs/web/biblia-livre/`. They exercise both layouts the crawler supports —
// split books (Gênesis: chapter-group subpages) and single-page books
// (Filemom: inline `CAPÍTULO <n>` headings) — against the committed
// `BLIVRE/bible.json` reference. They run with hard assertions and are skipped
// unless `OPENBIBLE_LIVE=1` (set by the non-blocking CI job), so a third-party
// drift or outage never drops the build: see `docs/tools/README.md`.
live('title(pt_BR) reads the book title', async () => {
    assert.equal(await new BibliaLivreCrawler().title(BookOf.Genesis, 'pt_BR'), 'Gênesis');
});

live('read(Gênesis 1) — split layout', async () => {
    assertLiveSample(
        'BibliaLivre Gênesis 1',
        await new BibliaLivreCrawler().read(BookOf.Genesis, 1, 'pt_BR'),
        { verses: 31, first: 'No princípio criou Deus os céus e a terra.' },
    );
});

live('read(Filemom 1) — single-page layout', async () => {
    assertLiveSample(
        'BibliaLivre Filemom 1',
        await new BibliaLivreCrawler().read(BookOf.Philemon, 1, 'pt_BR'),
        {
            verses: 25,
            first: 'Paulo, prisioneiro de Cristo Jesus, e o irmão Timóteo, a Filemom, o amado, e nosso cooperador;',
        },
    );
});

live('readAllChapters keeps every chapter for sampled books', async () => {
    const crawler = new BibliaLivreCrawler();

    assertChapters(
        'BibliaLivre Gênesis',
        await crawler.readAllChapters(BookOf.Genesis, 'pt_BR'),
        ChaptersOf[titleOf(BookOf.Genesis)],
    );

    assertChapters(
        'BibliaLivre Filemom',
        await crawler.readAllChapters(BookOf.Philemon, 'pt_BR'),
        ChaptersOf[titleOf(BookOf.Philemon)],
    );
});

live('fetchText reaches the book index over https', async () => {
    const html = await withRetry('https://sites.google.com/site/biblialivre/leia-a-b%C3%ADblia');

    assert.ok(html.length > 0, 'expected a non-empty book index');
});

function assertChapters(label: string, chapters: string[][], expected: number): void {
    assert.equal(chapters.length, expected, `${label}: expected ${expected} chapters, got ${chapters.length}`);

    for (let i = 0; i < chapters.length; i++) {
        assert.ok(chapters[i].length > 0, `${label}: chapter ${i + 1} returned no verses`);
    }
}
