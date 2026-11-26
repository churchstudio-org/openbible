import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

import { BookOf, BookTitle, ChaptersOf } from 'bible-crawler';

const execFileAsync = promisify(execFile);

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(here, '..');

interface RunResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

// Runs the CLI exactly like `bin/bible-dl` does (`node --import tsx src/bin.ts`),
// so the tests exercise the real entry point and its commander wiring.
async function runCli(args: string[]): Promise<RunResult> {
    try {
        const result = await execFileAsync(
            process.execPath,
            ['--import', 'tsx', 'src/bin.ts', ...args],
            { cwd: pkgDir, maxBuffer: 16 * 1024 * 1024, timeout: 120_000 },
        );

        return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
        const err = error as Error & { code?: number | null; stdout?: string; stderr?: string };

        return {
            exitCode: typeof err.code === 'number' ? err.code : 1,
            stdout: err.stdout ?? '',
            stderr: err.stderr ?? '',
        };
    }
}

function makeBible(): string[][][] {
    const books: string[][][] = [];

    for (let book = 1; book <= 66; book++) {
        const chapters = ChaptersOf[BookOf[book] as BookTitle];
        const chapter: string[] = [];

        for (let v = 1; v <= 30; v++) {
            chapter.push(`verse ${v} of book ${book}`);
        }

        books.push(Array.from({ length: chapters }, () => [...chapter]));
    }

    return books;
}

test('bible-dl --help lists the commands', async () => {
    const { exitCode, stdout } = await runCli(['--help']);

    assert.equal(exitCode, 0);
    for (const command of ['books', 'crawlers', 'download', 'validate', 'merge', 'clean', 'tokenize', 'diff']) {
        assert.ok(stdout.includes(command), `--help should list "${command}"`);
    }
});

test('books prints the 66 titles in order', async () => {
    const { exitCode, stdout } = await runCli(['books']);

    assert.equal(exitCode, 0);

    const lines = stdout.trim().split('\n');

    assert.equal(lines.length, 66);
    assert.ok(lines[0].includes('Genesis'));
    assert.ok(lines[65].includes('Revelation'));
});

test('books --json is a JSON array of the 66 titles', async () => {
    const { exitCode, stdout } = await runCli(['books', '--json']);

    assert.equal(exitCode, 0);

    const titles = JSON.parse(stdout) as string[];

    assert.equal(titles.length, 66);
    assert.equal(titles[0], 'Genesis');
    assert.equal(titles[65], 'Revelation');
});

test('crawlers lists the two crawlers with their languages', async () => {
    const { exitCode, stdout } = await runCli(['crawlers']);

    assert.equal(exitCode, 0);

    const lines = stdout.trim().split('\n');

    assert.equal(lines.length, 2);

    const [bibliaLine, wordLine] = lines.sort();

    assert.ok(bibliaLine.startsWith('BibliaLivre') || bibliaLine.startsWith('Bíblia Livre'));
    assert.ok(bibliaLine.includes('pt_BR'));
    assert.ok(wordLine.includes('en_US, ja_JP, ko_KR'));
});

test('download rejects an unknown crawler before any network access', async () => {
    const { exitCode, stdout, stderr } = await runCli([
        'download', '--crawler', 'NoSuchCrawler', '--language', 'en_US', '--book', 'Genesis',
    ]);

    assert.notEqual(exitCode, 0);
    assert.ok(
        (stdout + stderr).includes('Unknown crawler'),
        `expected "Unknown crawler" in output, got: ${stdout}${stderr}`,
    );
});

test('download rejects a language the crawler does not provide', async () => {
    const { exitCode, stdout, stderr } = await runCli([
        'download', '--crawler', 'Bíblia Livre', '--language', 'en_US', '--book', 'Genesis',
    ]);

    assert.notEqual(exitCode, 0);
    assert.ok(
        (stdout + stderr).includes('does not provide'),
        `expected "does not provide" in output, got: ${stdout}${stderr}`,
    );
});

test('validate accepts a well-formed bible.json', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-validate-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const file = path.join(dir, 'bible.json');

    fs.writeFileSync(file, JSON.stringify(makeBible()));
    const { exitCode, stdout } = await runCli(['validate', file]);

    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('Valid Bible.'));
    assert.ok(stdout.includes('66 books'));
    assert.ok(stdout.includes('1189 chapters'));
});

test('validate rejects a bible with too few books', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-validate-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const file = path.join(dir, 'bible.json');

    fs.writeFileSync(file, JSON.stringify(makeBible().slice(0, 10)));
    const { exitCode, stdout } = await runCli(['validate', file]);

    assert.notEqual(exitCode, 0);
    assert.ok(stdout.includes('Invalid Bible.'));
});

test('merge assembles the 66 book files into bible.json', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-merge-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const bible = makeBible();

    const titles = Object.keys(BookOf).filter((key) => !/^\d+$/.test(key));

    for (let i = 0; i < titles.length; i++) {
        fs.writeFileSync(path.join(dir, `${titles[i].toLowerCase()}.json`), JSON.stringify(bible[i]));
    }

    const { exitCode, stdout } = await runCli(['merge', dir]);

    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('66 books'));

    const merged = JSON.parse(fs.readFileSync(path.join(dir, 'bible.json'), 'utf8')) as string[][][];

    assert.equal(merged.length, 66);
    assert.deepEqual(merged[0], bible[0]);
});

test('merge fails when a book file is missing', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-merge-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const titles = Object.keys(BookOf).filter((key) => !/^\d+$/.test(key));

    for (const title of titles.slice(1)) {
        fs.writeFileSync(path.join(dir, `${title.toLowerCase()}.json`), JSON.stringify([[ 'a' ]]));
    }

    const { exitCode, stderr } = await runCli(['merge', dir]);

    assert.notEqual(exitCode, 0);
    assert.ok(stderr.includes('Missing book files'));
});

test('clean writes a .clean.json with the stopwords removed', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-clean-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const file = path.join(dir, 'genesis.json');

    fs.writeFileSync(file, JSON.stringify([['the quick brown fox', 'it jumps over']]));
    const { exitCode, stdout } = await runCli(['clean', '--language', 'en', file]);

    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('genesis.clean.json'));

    const cleaned = JSON.parse(fs.readFileSync(path.join(dir, 'genesis.clean.json'), 'utf8')) as string[][];

    assert.equal(cleaned[0][0], 'quick brown fox');
    assert.equal(cleaned[0][1], 'jumps');
});

test('tokenize writes a .tokens.json of word tokens', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-tokenize-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const file = path.join(dir, 'genesis.json');

    fs.writeFileSync(file, JSON.stringify([[['In the beginning... God created.']]]));
    const { exitCode, stdout } = await runCli(['tokenize', file]);

    assert.equal(exitCode, 0);
    assert.ok(stdout.includes('genesis.tokens.json'));

    const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'genesis.tokens.json'), 'utf8')) as string[][][];

    assert.equal(tokens[0][0][0], 'In the beginning God created');
});

test('diff reports a clean match and a differing bible', async (t) => {
    const dir = fs.mkdtempSync(path.join(tmpdir(), 'bible-dl-diff-'));

    t.after(() => {
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const bible = makeBible();

    const a = path.join(dir, 'a.json');
    const b = path.join(dir, 'b.json');
    const c = path.join(dir, 'c.json');

    fs.writeFileSync(a, JSON.stringify(bible));
    fs.writeFileSync(b, JSON.stringify(bible));
    bible[5].push(['an extra chapter']);
    fs.writeFileSync(c, JSON.stringify(bible));

    const same = await runCli(['diff', a, b]);

    assert.equal(same.exitCode, 0, same.stdout + same.stderr);
    assert.ok(same.stdout.includes('All books match.'));

    const different = await runCli(['diff', a, c]);

    assert.notEqual(different.exitCode, 0);
    assert.ok(different.stdout.includes('book(s) differ'));
});
