import { BookOf } from '../constants/books';
import { fetchText, parseHtml } from '../helpers/html.helper';
import { BibleVersions, Language } from '../types';
import { BaseCrawler } from './base.crawler';

/**
 * Extracts verses from a WordProject chapter page.
 *
 * The whole chapter lives in a single `<p>` inside `.textBody`; verses are
 * separated by `<br />`, and every verse N >= 2 is prefixed by
 * `<span class="verse" id="N">N </span>`. The first verse's number span is
 * commented out (`<!--span class="verse" id="1">1 </span-->`), so the first
 * text segment of the `<p>` must be kept as well.
 */
export function parseWordProjectChapter(html: string): string[] {
    const body = parseHtml(html).querySelector('.textBody p');

    if (!body) {
        return [];
    }

    const raw = body.rawText ?? body.innerHTML ?? '';

    return raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((segment) => segment.replace(/\s+/g, ' '))
        .map((segment) => segment.replace(/^\s*\d+\s+/, ''))
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
}

export function wordProjectUrl(template: string, book: BookOf, chapter: number): string {
    return template
        .replace('book', String(book).padStart(2, '0'))
        .replace('chapter', String(chapter));
}

export class WordProjectCrawler extends BaseCrawler {
    name: string = 'WordProject';
    attribution: string = 'WordProject® (International Biblical Association). Public domain / fair-use text, see https://www.wordproject.org/contact/new/copyrights.htm';
    website: string = 'https://wordproject.org/';
    delay: number = 2500;

    bibles: BibleVersions = {
        en_US: 'https://www.wordproject.org/bibles/kj/book/chapter.htm',
        ja_JP: 'https://www.wordproject.org/bibles/jp/book/chapter.htm',
        ko_KR: 'https://www.wordproject.org/bibles/kr/book/chapter.htm',
    };

    async title(book: BookOf, language: Language = 'en_US'): Promise<string> {
        const url = wordProjectUrl(this.bibles[language]!, book, 1);
        const html = await fetchText(url);
        const header = parseHtml(html).querySelector('.textHeader h1');

        return (header?.text ?? '').trim();
    }

    async read(book: BookOf, chapter: number, language: Language = 'en_US'): Promise<string[]> {
        const url = wordProjectUrl(this.bibles[language]!, book, chapter);
        const html = await fetchText(url);

        return parseWordProjectChapter(html);
    }
}
