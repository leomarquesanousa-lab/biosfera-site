import 'server-only';

import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from 'node:fs/promises';

import path from 'node:path';
import { randomUUID } from 'node:crypto';

const uploadDirectory = () =>
  path.resolve(
    process.env.UPLOAD_DIR ||
      'storage/uploads',
  );

const publicMediaDirectory = () =>
  path.resolve('public/media');

const IMAGE_FILENAME_REGEX =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

const VIDEO_FILENAME_REGEX =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(mp4|webm)$/;

export async function storeImage(
  bytes: Buffer,
) {
  const filename =
    `${randomUUID()}.webp`;

  await mkdir(
    uploadDirectory(),
    {
      recursive: true,
    },
  );

  await writeFile(
    path.join(
      uploadDirectory(),
      filename,
    ),
    bytes,
    {
      flag: 'wx',
    },
  );

  return `/media/${filename}`;
}

export async function readImage(
  filename: string,
) {
  if (
    !IMAGE_FILENAME_REGEX.test(
      filename,
    )
  ) {
    return null;
  }

  try {
    return await readFile(
      path.join(
        uploadDirectory(),
        filename,
      ),
    );
  } catch {
  }

  try {
    return await readFile(
      path.join(
        publicMediaDirectory(),
        filename,
      ),
    );
  } catch {
    return null;
  }
}

export async function discardImage(
  url: string,
) {
  const filename =
    url.split('/').pop() || '';

  if (
    !IMAGE_FILENAME_REGEX.test(
      filename,
    )
  ) {
    return;
  }

  await unlink(
    path.join(
      uploadDirectory(),
      filename,
    ),
  ).catch(() => {});
}

export async function storeVideo(
  bytes: Buffer,
  mimeType: string,
) {
  let extension:
    | 'mp4'
    | 'webm';

  if (
    mimeType === 'video/mp4'
  ) {
    extension = 'mp4';
  } else if (
    mimeType === 'video/webm'
  ) {
    extension = 'webm';
  } else {
    throw new Error(
      'Formato de vídeo inválido.',
    );
  }

  const filename =
    `${randomUUID()}.${extension}`;

  await mkdir(
    uploadDirectory(),
    {
      recursive: true,
    },
  );

  await writeFile(
    path.join(
      uploadDirectory(),
      filename,
    ),
    bytes,
    {
      flag: 'wx',
    },
  );

  return `/video-media/${filename}`;
}

export async function readVideo(
  filename: string,
) {
  if (
    !VIDEO_FILENAME_REGEX.test(
      filename,
    )
  ) {
    return null;
  }

  try {
    return await readFile(
      path.join(
        uploadDirectory(),
        filename,
      ),
    );
  } catch {
    return null;
  }
}

export async function discardVideo(
  url: string,
) {
  const filename =
    url.split('/').pop() || '';

  if (
    !VIDEO_FILENAME_REGEX.test(
      filename,
    )
  ) {
    return;
  }

  await unlink(
    path.join(
      uploadDirectory(),
      filename,
    ),
  ).catch(() => {});
}

export function videoContentType(
  filename: string,
) {
  if (
    filename.endsWith('.mp4')
  ) {
    return 'video/mp4';
  }

  if (
    filename.endsWith('.webm')
  ) {
    return 'video/webm';
  }

  return null;
}