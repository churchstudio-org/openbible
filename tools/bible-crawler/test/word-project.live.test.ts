import assert from 'node:assert/strict';

import { BookOf, BookTitle, WordProjectCrawler, ChaptersOf } from '../src';
import { assertLiveSample, live, withRetry } from './live.test-utils';

const titleOf = (book: BookOf): BookTitle => BookOf[book] as BookTitle;

// Live smoke tests against wordproject.org, recorded under `docs/web/wordproject/`.
// They cover the two languages re-sourced in this plan — en_US (KJV) and ja_JP
// (Kougo-yaku) — against the committed `KJV/bible.json` and `KOUGO_YAKU/bible.json`
// references. Same opt-in / non-blocking contract as the other smoke tests: see
// `docs/tools/README.md`, "Live smoke tests".
live('title(en_US) reads the book title', async () => {
    assert.equal(await new WordProjectCrawler().title(BookOf.Genesis, 'en_US'), 'Genesis');
});

live('title(ja_JP) reads the book title', async () => {
    assert.equal(await new WordProjectCrawler().title(BookOf.Genesis, 'ja_JP'), '創世記');
});

live('read(KJV) — en_US samples', async () => {
    const crawler = new WordProjectCrawler();

    assertLiveSample(
        'KJV Genesis 1',
        await crawler.read(BookOf.Genesis, 1, 'en_US'),
        { verses: 31, first: 'In the beginning God created the heaven and the earth.' },
    );

    assertLiveSample(
        'KJV Revelation 22',
        await crawler.read(BookOf.Revelation, 22, 'en_US'),
        { verses: 21, first: 'And he shewed me a pure river of water of life, clear as crystal' },
    );
});

live('read(Kougo-yaku) — ja_JP sample', async () => {
    assertLiveSample(
        'Kougo-yaku Genesis 1',
        await new WordProjectCrawler().read(BookOf.Genesis, 1, 'ja_JP'),
        { verses: 31, first: 'はじめに神は天と地とを創造された。' },
    );
});

live('readAllChapters keeps every chapter of one KJV book', async () => {
    const chapters = await new WordProjectCrawler().readAllChapters(BookOf.Genesis, 'en_US');

    assert.equal(
        chapters.length,
        ChaptersOf[titleOf(BookOf.Genesis)],
        `expected ${ChaptersOf[titleOf(BookOf.Genesis)]} chapters in Genesis`,
    );
});

live('fetchText reaches the KJV index over https', async () => {
    const html = await withRetry('https://www.wordproject.org/bibles/kj/index.htm');

    assert.ok(html.length > 0, 'expected a non-empty KJV index');
});
