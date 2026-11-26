import fs from 'node:fs';
import path from 'node:path';

import {
    BookOf,
    BookTitle,
    CrawlerHelper,
    ChaptersOf,
    Language,
} from 'bible-crawler';
import { Command, Option } from 'commander';

import { removeStopwords, tokenize } from './utils/lexer';
import { validateBible, ValidationResult } from './commands/validate';

const VERSION = '0.1.0';

// The 66 book titles in canonical order, skipping the numeric reverse-map keys
// that TypeScript adds at the front of `Object.keys(enum)`.
const BOOK_TITLES: BookTitle[] = Object.keys(BookOf)
    .filter((key) => !/^\d+$/.test(key))
    .map((key) => key as BookTitle);

function bookIndex(title: string): number {
    const index = BookOf[title as BookTitle];

    if (typeof index !== 'number') {
        throw new Error(`Unknown book "${title}". See \`bible-dl books\`.`);
    }

    return index;
}

function outputDir(output?: string): string {
    return output ? (output.endsWith(path.sep) ? output : output + path.sep) : process.cwd() + path.sep;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readJson(file: string): any {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function writeJson(file: string, data: any): void {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveAs(file: string, extension: string, data: any): string {
    const base = file.replace(/\.json$/i, '');
    const output = `${base}.${extension}.json`;

    writeJson(output, data);

    return output;
}

const program = new Command();

program
    .name('bible-dl')
    .description('Download, validate, merge and preprocess Bible text using bible-crawler.')
    .version(VERSION);

program
    .command('books')
    .description('List the Bible books')
    .option('--json', 'print as JSON')
    .action((options: { json?: boolean }) => {
        if (options.json) {
            console.log(JSON.stringify(BOOK_TITLES, null, 2));
            return;
        }

        for (const title of BOOK_TITLES) {
            console.log(`${String(bookIndex(title)).padStart(2)}  ${title}`);
        }
    });

program
    .command('crawlers')
    .description('List the available crawlers and their languages')
    .action(() => {
        for (const crawler of CrawlerHelper.list()) {
            console.log(`${crawler.name}\t${crawler.website}\t${crawler.languages().join(', ')}`);
        }
    });

program
    .command('download')
    .description('Download a book (or chapter) from a crawler to JSON')
    .requiredOption('--crawler <name>', 'crawler name (see `bible-dl crawlers`)')
    .requiredOption('--language <code>', 'language code, e.g. en_US')
    .requiredOption('--book <title>', 'book title, e.g. Genesis')
    .addOption(new Option('--chapter <n>', 'chapter number (default: all chapters)').argParser((value) => parseInt(value, 10)))
    .option('-o, --output <dir>', 'output directory (default: current directory)')
    .action(async (options: {
        crawler: string;
        language: string;
        book: string;
        chapter?: number;
        output?: string;
    }) => {
        const crawler = CrawlerHelper.find(options.crawler);

        if (!crawler) {
            const names = CrawlerHelper.list().map((candidate) => candidate.name).join(', ');
            throw new Error(`Unknown crawler "${options.crawler}". Available: ${names}.`);
        }

        if (!crawler.languages().includes(options.language as Language)) {
            throw new Error(
                `${crawler.name} does not provide "${options.language}". ` +
                `Available languages: ${crawler.languages().join(', ')}.`,
            );
        }

        const index = bookIndex(options.book);
        const dir = outputDir(options.output);

        if (options.chapter) {
            const verses = await crawler.read(index, options.chapter, options.language as Language);
            const file = `${dir}${options.book.toLowerCase()}_${options.chapter}.json`;

            writeJson(file, verses);
            console.log(`Saved ${file} (${verses.length} verses)`);
            return;
        }

        const chapters = await crawler.readAllChapters(index, options.language as Language);
        const file = `${dir}${options.book.toLowerCase()}.json`;

        writeJson(file, chapters);
        console.log(`Saved ${file} (${chapters.length}/${ChaptersOf[options.book as BookTitle]} chapters)`);
    });

program
    .command('validate <file>')
    .description('Validate a bible.json (66 books, 1189 chapters, ~30000 verses)')
    .action((file: string) => {
        const result: ValidationResult = validateBible(readJson(file));
        console.log(result.report());
        if (!result.ok) {
            process.exitCode = 1;
        }
    });

program
    .command('merge <dir>')
    .description('Merge <dir>/<book>.json files into <dir>/bible.json')
    .action((dir: string) => {
        const base = dir.endsWith(path.sep) ? dir : dir + path.sep;

        const missing = BOOK_TITLES.filter(
            (title) => !fs.existsSync(`${base}${title.toLowerCase()}.json`),
        );

        if (missing.length) {
            throw new Error(
                `Missing book files for: ${missing.map((title) => `${title.toLowerCase()}.json`).join(', ')}`,
            );
        }

        const bible = BOOK_TITLES.map((title) => readJson(`${base}${title.toLowerCase()}.json`));

        writeJson(`${base}bible.json`, bible);
        console.log(`Saved ${base}bible.json (${bible.length} books)`);
    });

program
    .command('clean <file>')
    .description('Remove stopwords from a book, chapter or bible JSON array and save a .clean.json')
    .requiredOption('--language <code>', 'language code for stopwords, e.g. en or pt')
    .action((file: string, options: { language: string }) => {
        const data = readJson(file);

        const walk = (node: unknown): unknown => {
            if (Array.isArray(node)) {
                return node.map(walk);
            }

            if (typeof node === 'string') {
                return removeStopwords(node, options.language);
            }

            return node;
        };

        const cleaned = walk(data);

        console.log(`Saved ${saveAs(file, 'clean', cleaned)}`);
    });

program
    .command('tokenize <file>')
    .description('Replace each verse of a bible.json by whitespace-separated word tokens and save a .tokens.json')
    .action((file: string) => {
        const bible = readJson(file);

        for (const book of bible) {
            for (const chapter of book) {
                for (let v = 0; v < chapter.length; v++) {
                    chapter[v] = tokenize(chapter[v]).join(' ');
                }
            }
        }

        console.log(`Saved ${saveAs(file, 'tokens', bible)}`);
    });

program
    .command('diff <fileA> <fileB>')
    .description('Compare two bible.json files, reporting per-book verse-count differences')
    .action((fileA: string, fileB: string) => {
        const bibleA = readJson(fileA);
        const bibleB = readJson(fileB);

        let failed = 0;
        const books = Math.min(bibleA.length, bibleB.length);

        for (let book = 0; book < books; book++) {
            const chapters = bibleA[book].length === bibleB[book].length;
            const differences: number[] = [];

            for (let chapter = 0; chapter < Math.min(bibleA[book].length, bibleB[book].length); chapter++) {
                if (bibleA[book][chapter].length !== bibleB[book][chapter].length) {
                    differences.push(chapter + 1);
                }
            }

            if (!chapters || differences.length) {
                failed += 1;
                const parts = [bibleA[book].length !== bibleB[book].length ? `chapter count ${bibleA[book].length}!=${bibleB[book].length}` : null];
                if (differences.length) {
                    parts.push(`verses differ: ${differences.join(', ')}`);
                }

                console.log(`× book ${book + 1}  ${parts.filter(Boolean).join('  ')}`);
            }
        }

        if (bibleA.length !== bibleB.length) {
            failed += 1;
            console.log(`× book count differs: ${bibleA.length} vs ${bibleB.length}`);
        }

        console.log(failed === 0 ? 'All books match.' : `${failed} book(s) differ.`);

        if (failed > 0) {
            process.exitCode = 1;
        }
    });

export async function main(argv: string[]): Promise<void> {
    // `argv` is the user arguments only (node and the script are already cut).
    await program.parseAsync(argv, { from: 'user' });
}
