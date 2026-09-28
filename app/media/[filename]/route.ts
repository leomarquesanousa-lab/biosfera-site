import { readImage } from '@/server/services/storage';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const bytes = await readImage((await params).filename);
  if (!bytes) return new Response('Imagem não encontrada.', { status: 404 });
  return new Response(new Uint8Array(bytes), { headers: {
    'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  } });
}
