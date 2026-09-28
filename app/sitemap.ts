import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/editorial/seo';
import { sitemapNews } from '@/server/repositories/editorial';
import { publicProgramming } from '@/server/services/programming';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news,programming] = await Promise.all([sitemapNews(),publicProgramming()]);
  return [{url:siteUrl()},{url:`${siteUrl()}/noticias`},...['programacao','programas','apresentadores'].map(path=>({url:`${siteUrl()}/${path}`})),...programming.programs.map(p=>({url:`${siteUrl()}/programas/${p.slug}`})),...programming.presenters.map(p=>({url:`${siteUrl()}/apresentadores/${p.slug}`})),...news.map(item=>({url:`${siteUrl()}/noticias/${item.slug}`,lastModified:item.updated_at}))];
}
