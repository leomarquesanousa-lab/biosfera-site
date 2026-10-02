import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { mkdtemp, readdir, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { S3Client } from '@aws-sdk/client-s3';

// Next resolves this marker at build time; this suite runs only in Node.
registerHooks({ resolve(specifier, context, next) {
  return specifier === 'server-only' ? { url: 'data:text/javascript,export {}', shortCircuit: true } : next(specifier, context);
} });
const storage = await import('../server/services/storage.ts');

test('storage: local compatibility, R2 upload/read/range/cleanup and safe failures', async () => {
  const names = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_ENDPOINT', 'R2_PUBLIC_URL', 'UPLOAD_DIR'];
  const previous = names.map(name => process.env[name]);
  const originalFetch = globalThis.fetch, originalSend = S3Client.prototype.send;
  const directory = await mkdtemp(path.join(tmpdir(), 'biosfera-storage-'));
  const objects = new Map();
  let localImage, localVideo;
  try {
    for (const name of names) delete process.env[name];
    process.env.UPLOAD_DIR = directory;
    const bytes = Buffer.from('0123456789');
    localImage = await storage.storeImage(bytes);
    localVideo = await storage.storeVideo(bytes, 'video/mp4');
    assert.deepEqual(await storage.readImage(path.basename(localImage)), bytes);
    assert.deepEqual(await storage.readVideo(path.basename(localVideo)), bytes);
    for (const [range, status, expected] of [['bytes=2-5', 206, '2345'], ['bytes=-3', 206, '789'], ['bytes=20-', 416, '']]) {
      const response = await storage.readVideoResponse(path.basename(localVideo), new Request('https://site.test/video', { headers: { range } }));
      assert.equal(response.status, status);
      assert.equal(await response.text(), expected);
    }
    const head = await storage.readVideoResponse(path.basename(localVideo), new Request('https://site.test/video', { method: 'HEAD' }));
    assert.equal(head.headers.get('content-length'), '10');
    assert.equal(await head.text(), '');
    assert.equal(await storage.readVideo('../escape.mp4'), null);
    await assert.rejects(storage.storeVideo(bytes, 'text/html'));

    Object.assign(process.env, { R2_ACCOUNT_ID: 'test', R2_ACCESS_KEY_ID: 'test', R2_SECRET_ACCESS_KEY: 'test', R2_BUCKET_NAME: 'test', R2_ENDPOINT: 'https://test.r2.cloudflarestorage.com', R2_PUBLIC_URL: 'https://media.example.test' });
    S3Client.prototype.send = async function(command) {
      if (command.constructor.name === 'PutObjectCommand') {
        assert.equal(command.input.Bucket, 'test');
        objects.set(command.input.Key, command.input);
      } else if (command.constructor.name === 'DeleteObjectCommand') objects.delete(command.input.Key);
      else assert.fail('Unexpected S3 operation');
      return {};
    };
    globalThis.fetch = async (url, options) => {
      const object = objects.get(new URL(url).pathname.slice(1));
      assert.equal(options.cache, 'no-store');
      if (!object) return new Response(null, { status: 404 });
      if (options.headers.has('range')) {
        assert.equal(options.headers.get('range'), 'bytes=2-5');
        return new Response(object.Body.subarray(2, 6), { status: 206, headers: { 'content-range': 'bytes 2-5/10', 'content-length': '4' } });
      }
      return new Response(options.method === 'HEAD' ? null : object.Body, { headers: { 'content-type': object.ContentType, 'content-length': String(object.Body.length) } });
    };
    // Previously stored local files remain readable with R2 enabled.
    assert.deepEqual(await storage.readVideo(path.basename(localVideo)), bytes);
    const image = await storage.storeImage(bytes), video = await storage.storeVideo(bytes, 'video/webm');
    assert.match(image, /^\/media\/.+\.webp$/);
    assert.match(video, /^\/video-media\/.+\.webm$/);
    assert.equal((await readdir(directory)).length, 2);
    assert.deepEqual(await storage.readImage(path.basename(image)), bytes);
    const remote = await storage.readVideoResponse(path.basename(video), new Request('https://site.test/video', { headers: { range: 'bytes=2-5' } }));
    assert.equal(remote.status, 206);
    assert.equal(remote.headers.get('content-range'), 'bytes 2-5/10');
    assert.equal(remote.headers.get('content-type'), 'video/webm');
    assert.equal(await remote.text(), '2345');
    await storage.discardImage(image);
    await storage.discardVideo(video);
    assert.equal(objects.size, 0);
    assert.equal(await storage.readVideo(path.basename(video)), null);
    globalThis.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(storage.readVideo(path.basename(video)), /ler a mídia/);
    S3Client.prototype.send = async () => { throw new Error('private credential'); };
    await assert.rejects(storage.storeVideo(bytes, 'video/mp4'), error => error.message.includes('R2') && !error.message.includes('private credential'));
    assert.equal((await readdir(directory)).length, 2, 'R2 errors must not silently write to local disk');
    delete process.env.R2_SECRET_ACCESS_KEY;
    await assert.rejects(storage.storeImage(bytes), /incompleta/);
  } finally {
    globalThis.fetch = originalFetch;
    S3Client.prototype.send = originalSend;
    for (const name of names.slice(0, -1)) delete process.env[name];
    if (localImage) await storage.discardImage(localImage);
    if (localVideo) await storage.discardVideo(localVideo);
    await rmdir(directory);
    names.forEach((name, i) => { if (previous[i] === undefined) delete process.env[name]; else process.env[name] = previous[i]; });
  }
});
