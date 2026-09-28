import 'server-only';
import type { News } from './types';
export function siteUrl() {
  try {
    const url = new URL(process.env.SITE_URL || 'http://localhost:3000');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.origin;
  } catch { return 'http://localhost:3000'; }
}
export function articleUrl(news: News) { return news.canonical_url || `${siteUrl()}/noticias/${news.slug}`; }
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g,'\\u003c'); }
