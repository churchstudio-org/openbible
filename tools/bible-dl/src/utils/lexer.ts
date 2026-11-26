// A small, dependency-light text processing layer.
//
// It replaces the stale `natural` and `stopword` packages the original
// bible-dl relied on. Those two libraries were unmaintained and the
// repository only needs to tokenize and strip stopwords for validation and
// comparison, so the utilities are written in-house (see the dependency
// audit in `docs/tools/`).

const ENGLISH_STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
    'from', 'had', 'has', 'have', 'he', 'her', 'him', 'his', 'in', 'into',
    'is', 'it', 'its', 'of', 'on', 'over', 'or', 'she', 'so', 'than',
    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
    'to', 'up', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
    'while', 'who', 'whom', 'will', 'with', 'would', 'you', 'your',
]);

const PORTUGUESE_STOPWORDS = new Set([
    'a', 'ao', 'aos', 'as', 'à', 'às', 'de', 'do', 'dos', 'da', 'das',
    'e', 'em', 'é', 'era', 'essa', 'esse', 'esta', 'este', 'foi', 'foram',
    'há', 'havia', 'lá', 'mais', 'mas', 'me', 'meu', 'mesmo', 'muito',
    'não', 'na', 'nas', 'no', 'nos', 'nós', 'nossa', 'nosso', 'o', 'ou', 'os',
    'para', 'pelo', 'pela', 'por', 'que', 'se', 'sem', 'ser', 'seu',
    'seus', 'sua', 'suas', 'são', 'só', 'também', 'te', 'teu', 'tu',
    'tua', 'tuas', 'um', 'uma', 'uns', 'umas', 'vos', 'você',
]);

export function stopwordsFor(language: string): Set<string> {
    const normalized = language.toLowerCase().split(/[-_]/)[0];

    if (normalized === 'pt') {
        return PORTUGUESE_STOPWORDS;
    }

    if (normalized === 'en') {
        return ENGLISH_STOPWORDS;
    }

    return new Set<string>();
}

export function tokenize(text: string): string[] {
    return text
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
        .filter((token) => token.length > 0);
}

export function removeStopwords(text: string, language: string): string {
    const stop = stopwordsFor(language);

    return tokenize(text)
        .filter((token) => !stop.has(token.toLowerCase()))
        .join(' ');
}
