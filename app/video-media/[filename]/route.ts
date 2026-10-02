import {
  readVideo,
  videoContentType,
} from '@/server/services/storage';

export const runtime =
  'nodejs';

type Context = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Context,
) {
  const { filename } =
    await params;

  const contentType =
    videoContentType(filename);

  if (!contentType) {
    return new Response(
      'Vídeo não encontrado.',
      {
        status: 404,
      },
    );
  }

  const bytes =
    await readVideo(filename);

  if (!bytes) {
    return new Response(
      'Vídeo não encontrado.',
      {
        status: 404,
      },
    );
  }

  return new Response(
    new Uint8Array(bytes),
    {
      headers: {
        'Content-Type':
          contentType,

        'Content-Length':
          String(
            bytes.length,
          ),

        'X-Content-Type-Options':
          'nosniff',

        'Cache-Control':
          'public, max-age=3600',
      },
    },
  );
}