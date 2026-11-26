import { BookOf, BookTitle } from '../constants/books';
import { ChaptersOf } from '../constants/chapters';
import { DelayHelper } from '../helpers/delay.helper';
import { fetchText, parseHtml } from '../helpers/html.helper';
import { BibleVersions, Language } from '../types';
import { BaseCrawler } from './base.crawler';

const BASE_URL = 'https://sites.google.com/site/biblialivre/leia-a-bíblia/';

// Canonical Portuguese book slugs, keyed by `BookTitle`, validated against the
// live book index of sites.google.com/site/biblialivre.
const PT_SLUGS: Record<BookTitle, string> = {
    Genesis: 'gênesis',
    Exodus: 'êxodo',
    Leviticus: 'levítico',
    Numbers: 'números',
    Deuteronomy: 'deuteronômio',
    Joshua: 'josué',
    Judges: 'juízes',
    Ruth: 'rute',
    Samuel1: '1-samuel',
    Samuel2: '2-samuel',
    Kings1: '1-reis',
    Kings2: '2-reis',
    Chronicles1: '1-crônicas',
    Chronicles2: '2-crônicas',
    Ezra: 'esdras',
    Nehemiah: 'neemias',
    Esther: 'ester',
    Job: 'jó',
    Psalms: 'salmos',
    Proverbs: 'provérbios',
    Ecclesiastes: 'eclesiastes',
    SongOfSolomon: 'cantares',
    Isaiah: 'isaías',
    Jeremiah: 'jeremias',
    Lamentations: 'lamentações',
    Ezekiel: 'ezequiel',
    Daniel: 'daniel',
    Hosea: 'oseias',
    Joel: 'joel',
    Amos: 'amós',
    Obadiah: 'obadias',
    Jonah: 'jonas',
    Micah: 'miqueias',
    Nahum: 'naum',
    Habakkuk: 'habacuque',
    Zephaniah: 'sofonias',
    Haggai: 'ageu',
    Zechariah: 'zacarias',
    Malachi: 'malaquias',
    Matthew: 'mateus',
    Mark: 'marcos',
    Luke: 'lucas',
    John: 'joão',
    Acts: 'atos',
    Romans: 'romanos',
    Corinthians1: '1-coríntios',
    Corinthians2: '2-coríntios',
    Galatians: 'gálatas',
    Ephesians: 'efésios',
    Philippians: 'filipenses',
    Colossians: 'colossenses',
    Thessalonians1: '1-tessalonicenses',
    Thessalonians2: '2-tessalonicenses',
    Timothy1: '1-timóteo',
    Timothy2: '2-timóteo',
    Titus: 'tito',
    Philemon: 'filemom',
    Hebrews: 'hebreus',
    James: 'tiago',
    Peter1: '1-pedro',
    Peter2: '2-pedro',
    John1: '1-joão',
    John2: '2-joão',
    John3: '3-joão',
    Jude: 'judas',
    Revelation: 'apocalipse',
};

interface ChapterGroup {
    from: number;
    to: number;
    url: string;
}

function absUrl(href: string): string {
    if (/^https?:\/\//.test(href)) {
        return href;
    }

    return 'https://sites.google.com' + (href.startsWith('/') ? '' : '/') + href;
}

// Returns the chapter range of a group-page token such as
// `gênesis-capítulos-11-15`, `levítico-16-20` or `números-capítulo-36`.
export function chapterGroupRange(token: string, slug: string): { from: number; to: number } | null {
    if (!token.startsWith(slug) || token.length === slug.length) {
        return null;
    }

    const nums = (token.slice(slug.length).match(/\d+/g) ?? []).map((part) => parseInt(part, 10));

    if (nums.length === 1) {
        return { from: nums[0], to: nums[0] };
    }

    if (nums.length === 2) {
        return { from: Math.min(nums[0], nums[1]), to: Math.max(nums[0], nums[1]) };
    }

    return null;
}

// Finds the book's own chapter-group subpages (not the shared site navigation).
export function findChapterGroups(html: string, slug: string): ChapterGroup[] {
    const doc = parseHtml(html);
    const byFrom = new Map<number, ChapterGroup>();

    for (const anchor of doc.querySelectorAll('a')) {
        const href = anchor.getAttribute('href');

        if (!href) {
            continue;
        }

        let decoded: string;

        try {
            decoded = decodeURIComponent(href);
        } catch {
            continue;
        }

        const segments = decoded.split('/').filter(Boolean);

        if (segments.length < 2) {
            continue;
        }

        const parent = segments[segments.length - 2];
        const token = segments[segments.length - 1];

        if (parent !== slug) {
            continue;
        }

        const range = chapterGroupRange(token, slug);

        if (!range || byFrom.has(range.from)) {
            continue;
        }

        byFrom.set(range.from, { from: range.from, to: range.to, url: absUrl(href) });
    }

    return [...byFrom.values()].sort((a, b) => a.from - b.from);
}

function ltrParagraphs(html: string): string[] {
    return parseHtml(html)
        .querySelectorAll('p')
        .filter((paragraph) => paragraph.getAttribute('dir') === 'ltr')
        .map((paragraph) => (paragraph.text ?? '')
            .replace(/\xa0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim());
}

// Parses a chapter-group page: one `<p dir="ltr">` per verse in the form
// `<ABBREV> <chapter>:<verse> <text>` (e.g. `GEN 1:1 No princípio...`).
export function parseChapterGroupPage(html: string): Map<number, string[]> {
    const byChapter = new Map<number, string[]>();

    for (const line of ltrParagraphs(html)) {
        const match = line.match(/^\S+\s+(\d+):(\d+)\s+(.*)$/);

        if (!match) {
            continue;
        }

        const chapter = parseInt(match[1], 10);
        const verse = match[3].trim();

        if (!verse) {
            continue;
        }

        if (!byChapter.has(chapter)) {
            byChapter.set(chapter, []);
        }

        byChapter.get(chapter)!.push(verse);
    }

    return byChapter;
}

// Parses a single-page book: `CAPÍTULO <n>` headings separate chapters and
// verses are lines starting with a number. Subtitle and `|fn:` footnote lines
// are dropped, matching the committed BLIVRE data.
export function parseInlineBook(html: string): string[][] {
    const chapters: string[][] = [];
    let current: string[] | null = null;

    for (const line of ltrParagraphs(html)) {
        if (/^CAPÍTULO\s+\d+$/i.test(line)) {
            current = [];
            chapters.push(current);

            continue;
        }

        if (/^\d+\s|\d+$/.test(line)) {
            const verse = line.replace(/^\d+\s*/, '').trim();

            if (verse && current) {
                current.push(verse);
            }
        }
    }

    return chapters;
}

export function bookTitle(html: string): string {
    return (parseHtml(html).querySelector('h1')?.text ?? '').trim();
}

export class BibliaLivreCrawler extends BaseCrawler {
    name: string = 'Bíblia Livre';
    attribution: string = 'Bíblia Livre (BLIVRE), Creative Commons Atribuição 3.0 Brasil (http://creativecommons.org/licenses/by/3.0/br/). Fonte: https://sites.google.com/site/biblialivre/';
    website: string = 'https://sites.google.com/site/biblialivre';
    delay: number = 2500;

    bibles: BibleVersions = {
        pt_BR: 'https://sites.google.com/site/biblialivre/leia-a-bíblia/',
    };

    private readonly cache = new Map<BookTitle, string[][]>();

    private slugOf(book: BookOf): string {
        const title = BookOf[book] as BookTitle;

        return PT_SLUGS[title];
    }

    async title(book: BookOf, _language: Language = 'pt_BR'): Promise<string> {
        const html = await fetchText(BASE_URL + this.slugOf(book));

        return bookTitle(html);
    }

    async readAllChapters(book: BookOf, _language: Language = 'pt_BR'): Promise<string[][]> {
        const title = BookOf[book] as BookTitle;
        const cached = this.cache.get(title);

        if (cached) {
            return cached;
        }

        const slug = this.slugOf(book);
        const expected = ChaptersOf[title];
        const bookHtml = await fetchText(BASE_URL + slug);
        const groups = findChapterGroups(bookHtml, slug);

        let chapters: string[][];

        if (groups.length) {
            chapters = new Array<string[]>(expected).fill([]);

            for (const group of groups) {
                const parsed = parseChapterGroupPage(await fetchText(group.url));

                for (const [chapter, verses] of parsed) {
                    if (chapter >= 1 && chapter <= expected) {
                        chapters[chapter - 1] = verses;
                    }
                }

                await DelayHelper.wait(this.delay);
            }
        } else {
            chapters = parseInlineBook(bookHtml);
        }

        this.cache.set(title, chapters);

        return chapters;
    }

    async read(book: BookOf, chapter: number, _language: Language = 'pt_BR'): Promise<string[]> {
        const chapters = await this.readAllChapters(book);

        return chapters[chapter - 1] ?? [];
    }
}
