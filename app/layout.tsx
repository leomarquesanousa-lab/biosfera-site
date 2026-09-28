import type { Metadata } from 'next';
import { RadioProvider } from '@/components/radio/radio-player';
import { getSettings } from '@/server/services/settings';
import './globals.css';
import './visual-refresh.css';
import { currentProgramming } from '@/server/services/programming';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Biosfera Rádio TV Web', description: 'Biosfera: rádio ao vivo, informação e conexão.' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings,programming] = await Promise.all([getSettings(),currentProgramming()]);
  return <html lang="pt-BR"><body><RadioProvider streamUrl={settings.radioStreamUrl} initialProgramming={programming}>{children}</RadioProvider></body></html>;
}
