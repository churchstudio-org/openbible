export interface ValidationResult {
    ok: boolean;
    books: number;
    chapters: number;
    verses: number;

    report(): string;
}

// A valid Bible has 66 books, 1189 chapters and about 30000 verses.
export function validateBible(bible: string[][][]): ValidationResult {
    const books = bible.length;
    const chapters = bible.reduce((sum, book) => sum + book.length, 0);
    const verses = bible.reduce((sum, book) => sum + book.reduce((s, chapter) => s + chapter.length, 0), 0);
    const ok = books === 66 && chapters === 1189 && verses >= 30000;

    const mark = (pass: boolean) => (pass ? '√' : '×');

    return {
        ok,
        books,
        chapters,
        verses,
        report: () => [
            `${mark(books === 66)} ${books} books (expected 66)`,
            `${mark(chapters === 1189)} ${chapters} chapters (expected 1189)`,
            `${mark(verses >= 30000)} ${verses} verses (expected at least 30000)`,
            ok ? 'Valid Bible.' : 'Invalid Bible.',
        ].join('\n'),
    };
}
