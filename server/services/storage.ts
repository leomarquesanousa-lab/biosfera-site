import 'server-only';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
// Interface pequena: a implementação pode ser substituída por storage externo.
// Arquivos de runtime não integram o bundle; storage deve ser persistido separadamente.
const directory = () => path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || 'storage/uploads');
export async function storeImage(bytes: Buffer) {
  const filename = `${randomUUID()}.webp`;
  await mkdir(directory(), { recursive: true });
  await writeFile(path.join(directory(), filename), bytes, { flag: 'wx' });
  return `/media/${filename}`;
}
export async function readImage(filename: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(filename)) return null;
  try { return await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ directory(), filename)); } catch { return null; }
}
export async function discardImage(url: string) {
  const filename = url.split('/').pop() || '';
  if (/^[a-f0-9-]{36}\.webp$/.test(filename)) await unlink(path.join(/* turbopackIgnore: true */ directory(),filename)).catch(() => {});
}
