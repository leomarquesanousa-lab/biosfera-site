import { randomUUID } from 'node:crypto';
import { getUser } from '@/lib/auth/session';
import { getPool } from '@/lib/db/pool';
import { normalizeImage, MAX_IMAGE_BYTES } from '@/lib/editorial/image.mjs';
import { storeImage, discardImage } from '@/server/services/storage';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const user = await getUser();
  if (!user || !['OWNER','ADMIN','EDITOR'].includes(user.role)) return Response.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  try {
    const expected = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (new URL(request.headers.get('origin') || '').host !== expected) throw new Error();
  } catch { return Response.json({ error: 'Origem inválida.' }, { status: 403 }); }
  if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES) return Response.json({ error: 'O limite é 5 MB.' }, { status: 413 });
  let stored = '';
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.length;
      if (length > MAX_IMAGE_BYTES) { await reader.cancel(); return Response.json({ error: 'O limite é 5 MB.' }, { status: 413 }); }
      chunks.push(part.value);
    }
    const filename = decodeURIComponent(request.headers.get('x-file-name') || '').slice(0, 255);
    const bytes = await normalizeImage(Buffer.concat(chunks), filename, request.headers.get('content-type') || '');
    stored = await storeImage(bytes);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      const id = randomUUID();
      await client.query("INSERT INTO media_assets(id,path,mime_type,size,created_by) VALUES($1,$2,'image/webp',$3,$4)", [id,stored,bytes.length,user.id]);
      await client.query("INSERT INTO audit_log(user_id,action,entity,entity_id) VALUES($1,'media.upload','media_assets',$2)", [user.id,id]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    return Response.json({ url: stored }, { status: 201 });
  } catch {
    if (stored) await discardImage(stored);
    return Response.json({ error: 'Não foi possível enviar. Use JPEG, PNG ou WebP válido, até 5 MB e 20 megapixels.' }, { status: 400 });
  }
}
