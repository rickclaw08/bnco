/**
 * ClawOps Scanner - HTML Fetcher
 */
import { logger } from './logger';

export async function fetchHtml(url: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClawOpsScanner/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.warn('[FetchHtml] Non-OK response', { url, status: response.status });
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      logger.warn('[FetchHtml] Non-HTML content type', { url, contentType });
      return null;
    }

    const html = await response.text();
    return html.slice(0, 500_000); // Limit to 500KB
  } catch (error: any) {
    logger.warn('[FetchHtml] Failed', { url, error: error.message });
    return null;
  }
}
