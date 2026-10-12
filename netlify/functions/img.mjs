import { store } from '../lib/common.mjs';
export default async (req) => {
  const name = new URL(req.url).pathname.split('/').pop();
  if (!/^[\w.-]{1,60}$/.test(name)) return new Response('Not found', { status: 404 });
  try {
    const r = await store('bee-golden-img').getWithMetadata(name, { type: 'arrayBuffer' });
    if (!r) return new Response('Not found', { status: 404 });
    return new Response(r.data, { headers: { 'Content-Type': (r.metadata && r.metadata.type) || 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
};
export const config = { path: '/api/img/*' };
