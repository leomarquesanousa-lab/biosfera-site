import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Broadcast } from '@/components/programming/broadcast';
import { currentProgramming } from '@/server/services/programming';
import { getSettings } from '@/server/services/settings';
import { ContactForm } from '@/components/contact-form';
import { pageMetadata } from '@/lib/editorial/seo';

type Props={params:Promise<{section:string}>};

const sectionSeo:Record<string,{title:string;description:string}>={
 radio:{title:'Rádio ao Vivo | Biosfera Rádio TV Web',description:'Ouça a Biosfera Rádio TV Web ao vivo e acompanhe a programação enquanto navega pelo portal.'},
 videos:{title:'Vídeos | Biosfera Rádio TV Web',description:'Acompanhe vídeos, entrevistas, programas e conteúdos da Biosfera Rádio TV Web.'},
 contato:{title:'Contato | Biosfera Rádio TV Web',description:'Entre em contato com a equipe da Biosfera Rádio TV Web para enviar sugestões, dúvidas e ideias.'},
 'tv-ao-vivo':{title:'TV ao Vivo | Biosfera Rádio TV Web',description:'Acompanhe a área de transmissão de TV ao vivo da Biosfera Rádio TV Web.'},
};

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {section}=await params;const seo=sectionSeo[section];
 if(!seo)return {title:'Página não encontrada',robots:{index:false,follow:false}};
 return pageMetadata({...seo,path:`/${section}`});
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  if (section === 'radio') {
    const [settings, programming] = await Promise.all([getSettings(), currentProgramming()]);
    return <><h1>Rádio ao vivo</h1><p className="public-page-intro">Sua companhia, em qualquer lugar. A transmissão continua enquanto você navega pelo portal.</p><Broadcast siteName={settings.siteName} initial={programming}/></>;
  }
  if (section === 'videos') return <section aria-labelledby="videos-title"><h1 id="videos-title">Vídeos</h1><p className="public-page-intro">Um espaço para acompanhar entrevistas, programas e histórias da Biosfera.</p><div className="empty-state videos-empty"><span aria-hidden="true" className="video-empty-icon">▷</span><h2>Nossos vídeos chegam em breve</h2><p>Quando houver vídeos publicados, você poderá assistir por aqui.</p><Link className="button" href="/radio">Ouvir a rádio ao vivo</Link></div></section>;
  if (section === 'contato') return <section aria-labelledby="contact-title"><h1 id="contact-title">Contato</h1><p className="public-page-intro">Sua participação faz parte da Biosfera. Compartilhe sugestões, dúvidas e ideias com a nossa equipe.</p><ContactForm/></section>;
  if (section === 'tv-ao-vivo') return <section className="section-placeholder"><h1>TV ao vivo</h1><p>Espaço reservado para a futura integração da transmissão de TV.</p><span className="tag">Conteúdo estrutural · Em preparação</span><Link href="/">← Voltar ao início</Link></section>;
  notFound();
}
