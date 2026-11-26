import assert from 'node:assert/strict';
import test from 'node:test';

import {
    bookTitle,
    chapterGroupRange,
    findChapterGroups,
    parseChapterGroupPage,
    parseInlineBook,
} from '../src/core/biblia-livre.crawler';
import {
    parseWordProjectChapter,
    WordProjectCrawler,
    wordProjectUrl,
} from '../src/core/word-project.crawler';
import { CrawlerHelper } from '../src/helpers/crawler.helper';
import { BookOf } from '../src/constants/books';
import { ChaptersOf } from '../src/constants/chapters';
import {
    genesisBookPage,
    genesisGroupPage,
    philemonBookPage,
    wordProjectBody,
} from './fixtures';

test('wordProjectUrl zeroes the book and fills the chapter', () => {
    const template = 'https://www.wordproject.org/bibles/kj/book/chapter.htm';

    assert.equal(wordProjectUrl(template, BookOf.Genesis, 1), 'https://www.wordproject.org/bibles/kj/01/1.htm');
    assert.equal(wordProjectUrl(template, BookOf.Revelation, 22), 'https://www.wordproject.org/bibles/kj/66/22.htm');
});

test('parseWordProjectChapter keeps verse 1 despite the commented-out span', () => {
    const verses = parseWordProjectChapter(wordProjectBody);

    assert.ok(verses[0].startsWith('In the beginning God created the heaven and the earth.'));
    assert.ok(verses[1].startsWith('And the earth was without form, and void;'));
    assert.equal(verses.length, 3);
});

test('wordproject crawler exposes en_US, ja_JP and ko_KR', () => {
    const languages = new WordProjectCrawler().languages().sort();

    assert.deepEqual(languages, ['en_US', 'ja_JP', 'ko_KR']);
});

test('CrawlerHelper lists the two remaining crawlers (no Just1Word)', () => {
    const names = CrawlerHelper.list().map((crawler) => crawler.name).sort();

    assert.deepEqual(names, ['Bíblia Livre', 'WordProject']);
    assert.equal(CrawlerHelper.find('Just1Word'), undefined);
    assert.equal(CrawlerHelper.find('WordProject')?.website, 'https://wordproject.org/');
});

test('chapterGroupRange reads the range from a group slug', () => {
    assert.deepEqual(chapterGroupRange('gênesis-capítulos-11-15', 'gênesis'), { from: 11, to: 15 });
    assert.deepEqual(chapterGroupRange('levítico-16-20', 'levítico'), { from: 16, to: 20 });
    assert.deepEqual(chapterGroupRange('números-capítulo-36', 'números'), { from: 36, to: 36 });
    assert.equal(chapterGroupRange('gênesis', 'gênesis'), null);
    assert.equal(chapterGroupRange('filemom', 'filemom'), null);
});

test('findChapterGroups returns the book`s own groups and ignores navigation', () => {
    const groups = findChapterGroups(genesisBookPage, 'gênesis');

    assert.deepEqual(
        groups
            .map((group) => [group.from, group.to])
            .sort((a, b) => a[0] - b[0]),
        [[1, 5], [6, 10], [11, 15], [16, 20], [21, 25], [26, 30], [31, 35], [36, 40], [41, 45], [46, 50]],
    );
});

test('findChapterGroups finds nothing on a single-page book', () => {
    assert.deepEqual(findChapterGroups(philemonBookPage, 'filemom'), []);
});

test('parseChapterGroupPage groups the 138 verses of Genesis 1-5 by chapter', () => {
    const byChapter = parseChapterGroupPage(genesisGroupPage);

    assert.equal(byChapter.get(1)!.length, 31);
    assert.equal(byChapter.get(5)!.length, 32);
    assert.ok(byChapter.get(1)![0].startsWith('No princípio criou Deus os céus e a terra.'));
});

test('parseInlineBook splits Filemom and drops subtitle and footnote lines', () => {
    const chapters = parseInlineBook(philemonBookPage);

    assert.equal(chapters.length, 1);
    assert.equal(chapters[0][0], 'Paulo, prisioneiro de Cristo Jesus, e o irmão Timóteo, a Filemom, o amado, e nosso cooperador;');
    assert.ok(!chapters[0].some((verse) => verse.includes('|fn:')));
});

test('bookTitle reads the h1', () => {
    assert.equal(bookTitle('<h1><span>Gênesis</span></h1>'), 'Gênesis');
    assert.equal(bookTitle('<h1> 創世記 </h1>'), '創世記');
});

test('constants: 66 books and 1189 chapters', () => {
    const titles = Object.keys(ChaptersOf) as Array<keyof typeof ChaptersOf>;
    const chapterCount = titles.reduce((sum, title) => sum + ChaptersOf[title], 0);

    assert.equal(titles.length, 66);
    assert.equal(chapterCount, 1189);
    assert.equal(BookOf.Revelation, 66);
});
