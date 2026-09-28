import { Brand } from '@/components/brand';
import { notFound } from 'next/navigation';
import Link from 'next/link';
const sections: Record<string, [string, string]> = {
  noticias: ['Notícias', 'Espaço reservado para o futuro conteúdo editorial da Biosfera.'],
  radio: ['Rádio ao vivo', 'Sua companhia está no ar. Use o player na parte inferior da tela para ouvir a Biosfera. A reprodução continua durante a navegação interna.'],
  'tv-ao-vivo': ['TV ao vivo', 'Espaço reservado para a futura integração da transmissão de TV.'],
  videos: ['Vídeos', 'Espaço reservado para os futuros vídeos da Biosfera.'],
  contato: ['Contato', 'Os canais oficiais de contato serão publicados em uma próxima fase.'],
};
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = Object.hasOwn(sections, section) ? sections[section] : undefined;
  if (!item) notFound();
  return <section className="section-placeholder" id="radio-info"><Brand/><h1>{item[0]}</h1><p>{item[1]}</p><span className="tag">{section === 'radio' ? 'Rádio disponível no player' : 'Conteúdo estrutural · Em preparação'}</span><Link href="/">← Voltar ao início</Link></section>;
}
