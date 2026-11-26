import assert from 'node:assert/strict';
import test from 'node:test';

import { BookOf, ChaptersOf, BookTitle } from 'bible-crawler';
import { validateBible } from '../src/commands/validate';
import { removeStopwords, tokenize } from '../src/utils/lexer';

function makeBible(): string[][][] {
    // Build a bible with exactly 1189 chapters and ~30000 verses.
    const books: Array<Array<string[]>> = [];

    for (let i = 1; i <= 66; i++) {
        const chaptersInBook = (ChaptersOf as Record<string, number>)[BookOf[i] as BookTitle];
        const book: string[][] = [];

        for (let c = 0; c < chaptersInBook; c++) {
            const verses: string[] = [];

            for (let v = 0; v < 30; v++) {
                verses.push(`verse ${v} in chapter ${c} of a real book`);
            }

            book.push(verses);
        }

        books.push(book);
    }

    return books;
}

test('validateBible accepts a well-formed bible', () => {
    const result = validateBible(makeBible());

    assert.equal(result.books, 66);
    // 3 verses per chapter, summed across the real 1189 chapters.
    assert.equal(result.chapters, 1189, result.report());
    assert.ok(result.verses >= 30000, result.report());
});

test('validateBible rejects a short bible', () => {
    const result = validateBible(makeBible().slice(0, 60));

    assert.equal(result.ok, false);
    assert.equal(result.books, 60);
});

test('validateBible rejects a bible with only one chapter per book', () => {
    const bible = makeBible().map((book) => [book[0]]);

    assert.equal(validateBible(bible).ok, false);
});

test('tokenize strips surrounding punctuation and empties', () => {
    assert.deepEqual(tokenize('  Hello, world! '), ['Hello', 'world']);
    assert.deepEqual(tokenize('(a) b'), ['a', 'b']);
    assert.deepEqual(tokenize('   '), []);
});

test('removeStopwords drops English stopwords', () => {
    // 'the' and 'over' are common English stopwords.
    assert.equal(removeStopwords('the Quick brown fox jumps over the lazy dog', 'en'), 'Quick brown fox jumps lazy dog');
});

test('removeStopwords drops Portuguese stopwords', () => {
    // 'a' and 'o' are Portuguese stopwords.
    assert.equal(removeStopwords('um x e um y', 'pt_BR'), 'x y');
});

test('removeStopwords keeps everything for unknown languages', () => {
    assert.equal(removeStopwords('the fox', 'xx'), 'the fox');
});

test('BookOf enum sanity: Genesis is 1, Revelation is 66', () => {
    assert.equal(BookOf.Genesis, 1);
    assert.equal(BookOf.Revelation, 66);
});
