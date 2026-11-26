import { BookOf, BookTitle } from '../constants/books';
import { ChaptersOf } from '../constants/chapters';
import { DelayHelper } from '../helpers/delay.helper';
import { BibleVersions, Language } from '../types';
import { IBibleCrawler } from './bible-crawler.interface';

export abstract class BaseCrawler implements IBibleCrawler {
    abstract name: string;
    abstract attribution: string;
    abstract website: string;
    abstract bibles: BibleVersions;
    abstract delay: number;

    abstract title(book: BookOf, language: Language): Promise<string>;
    abstract read(book: BookOf, chapter: number, language: Language): Promise<string[]>;

    languages(): Language[] {
        return Object.keys(this.bibles) as Language[];
    }

    async readAllChapters(book: BookOf, language: Language): Promise<string[][]> {
        const length = ChaptersOf[BookOf[book] as BookTitle];
        const chapters: string[][] = [];

        for (let chapter = 1; chapter <= length; chapter++) {
            chapters.push(await this.read(book, chapter, language));
            await DelayHelper.wait(this.delay);
        }

        return chapters;
    }

    async readAllBooks(language: Language): Promise<string[][][]> {
        const bible: string[][][] = [];

        for (let book = 1; book <= 66; book++) {
            bible.push(await this.readAllChapters(book as BookOf, language));
        }

        return bible;
    }
}
