import 'server-only';

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const uploadDirectory = () =>
  path.resolve(process.env.UPLOAD_DIR || 'storage/uploads');

const publicMediaDirectory = () =>
  path.resolve('public/media');

const IMAGE_FILENAME_REGEX =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export async function storeImage(bytes: Buffer) {
  const filename = `${randomUUID()}.webp`;

  await mkdir(uploadDirectory(), { recursive: true });

  await writeFile(
    path.join(uploadDirectory(), filename),
    bytes,
    { flag: 'wx' },
  );

  return `/media/${filename}`;
}

export async function readImage(filename: string) {
  if (!IMAGE_FILENAME_REGEX.test(filename)) {
    return null;
  }

  // Primeiro tenta o storage de runtime.
  try {
    return await readFile(
      path.join(uploadDirectory(), filename),
    );
  } catch {
    // Continua para o fallback.
  }

  // Fallback para imagens versionadas junto com o site.
  try {
    return await readFile(
      path.join(publicMediaDirectory(), filename),
    );
  } catch {
    return null;
  }
}

export async function discardImage(url: string) {
  const filename = url.split('/').pop() || '';

  if (!IMAGE_FILENAME_REGEX.test(filename)) {
    return;
  }

  await unlink(
    path.join(uploadDirectory(), filename),
  ).catch(() => {});
}