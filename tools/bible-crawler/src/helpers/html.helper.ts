import { parse } from 'node-html-parser';

export interface LoadOptions {
    headers?: Record<string, string>;
    timeoutMs?: number;
}

export async function fetchText(url: string, options: LoadOptions = {}): Promise<string> {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 30_000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: { 'user-agent': 'openbible-tools/0.0 (bible-crawler)', ...options.headers },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText} fetching ${url}`);
        }

        return await response.text();
    } finally {
        clearTimeout(timer);
    }
}

export function parseHtml(html: string) {
    return parse(html);
}
