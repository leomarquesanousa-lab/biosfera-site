import Link from 'next/link';
import { AdBanner } from '@/components/ads/banner';
import { adPositions } from '@/lib/admin/policy.mjs';
import { Broadcast } from '@/components/programming/broadcast';
import { currentProgramming } from '@/server/services/programming';
import { LiveCamera } from '@/components/home/live-camera';
import { ChatPreview } from '@/components/home/chat-preview';
import { SongRequest } from '@/components/home/song-request';
import { NewsCard } from '@/components/editorial/news-card';
import { getSettings } from '@/server/services/settings';
import { homeNews } from '@/server/repositories/editorial';
export default async function Home() {
  const [settings,news,programming]=await Promise.all([getSettings(),homeNews(),currentProgramming()]);
  return <div className="portal-home">
    <div className="home-welcome"><p className="eyebrow">SINTONIZE. PARTICIPE. CONECTE-SE.</p><h1>Sua rádio. Seu mundo.</h1></div>
    <Broadcast siteName={settings.siteName} initial={programming}/>
    <section className={`home-headlines ${news.lead.length===1?'single-headline':''}`} aria-label="Notícias principais">
      {news.lead.length ? <><div className="home-section-heading"><h2>Informação que aproxima.</h2><Link href="/noticias">Ver todas as notícias ↗</Link></div><div className="headline-grid">{news.lead.map(item=><NewsCard key={item.id} news={item} />)}</div></> : <div className="institutional-band"><p className="eyebrow">ACOMPANHE A BIOSFERA</p><h2>Som, imagem e você.<br/>Tudo na mesma sintonia.</h2><p>Ouça a rádio, abra a câmera ao vivo e fique por perto. A Biosfera acompanha o seu dia.</p><div><a href="#radio-ao-vivo">Ouvir a rádio ↗</a><a href="#camera-ao-vivo">Ver a câmera ↗</a><a href="#programacao-radio">Programação ↗</a></div></div>}
    </section>
    <AdBanner position={adPositions.homeBetween}/><div className="portal-row community-row"><LiveCamera url={settings.liveCameraEmbedUrl} /><ChatPreview /></div>
    <SongRequest startedAt={news.renderedAt} /><AdBanner position={adPositions.homeBottom}/>
    {news.recent.length>0 && <section className="home-latest"><div className="home-section-heading"><h2>Últimas notícias</h2><Link href="/noticias">Ver todas as notícias ↗</Link></div><div className="news-grid">{news.recent.map(item=><NewsCard key={item.id} news={item} />)}</div></section>}
  </div>;
}
