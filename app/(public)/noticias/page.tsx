import type { Metadata } from 'next';
import { PublicNews } from '@/components/editorial/public-news';
export const metadata: Metadata = { title: 'Notícias | Biosfera Rádio TV Web', description: 'Últimas notícias da Biosfera Rádio TV Web.' };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) { return <PublicNews query={await searchParams} />; }
