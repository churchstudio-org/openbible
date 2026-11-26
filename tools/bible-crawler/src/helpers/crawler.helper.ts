import { IBibleCrawler } from '../core/bible-crawler.interface';
import { BibliaLivreCrawler } from '../core/biblia-livre.crawler';
import { WordProjectCrawler } from '../core/word-project.crawler';

export class CrawlerHelper {
    static list(): IBibleCrawler[] {
        return [
            new BibliaLivreCrawler(),
            new WordProjectCrawler(),
        ];
    }

    static find(name: string): IBibleCrawler | undefined {
        return CrawlerHelper.list().find((crawler) => crawler.name === name);
    }
}
