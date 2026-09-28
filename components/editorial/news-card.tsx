/* eslint-disable @next/next/no-img-element -- uploads locais já limitados a 2400px */
import Link from 'next/link';
import type { News } from '@/lib/editorial/types';
export function NewsCard({ news, featured = false }: { news: News; featured?: boolean }) {
  return <article className={`news-card ${featured ? 'featured-news' : ''}`}>
    {news.cover_image && <Link href={`/noticias/${news.slug}`} tabIndex={-1} aria-hidden="true"><img src={news.cover_image} alt="" loading={featured ? 'eager' : 'lazy'} /></Link>}
    <div className="news-card-copy"><div className="category-tags">{news.categories.filter(c=>c.active).map(category=><Link key={category.id} href={`/noticias?category=${category.slug}`}>{category.name}</Link>)}</div>
      <h2><Link href={`/noticias/${news.slug}`}>{news.title}</Link></h2><p>{news.excerpt || news.subtitle}</p>
      <small>{news.author_name} · {news.visible_at && new Date(news.visible_at).toLocaleDateString('pt-BR',{timeZone:'UTC'})}</small>
    </div>
  </article>;
}
