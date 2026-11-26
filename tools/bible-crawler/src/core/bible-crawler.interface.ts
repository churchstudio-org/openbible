import { BookOf } from "../constants/books";
import { BibleVersions, Language } from "../types";

export interface IBibleCrawler {
    name: string;
    attribution: string;
    website: string;
    bibles: BibleVersions;
    delay: number;
    
    languages(): Language[];
    title(book: BookOf, language: Language): Promise<string>;
    read(book: BookOf, chapter: number, language: Language): Promise<string[]>;
    readAllChapters(book: BookOf, language: Language): Promise<string[][]>;
    readAllBooks(language: Language): Promise<string[][][]>;
}
