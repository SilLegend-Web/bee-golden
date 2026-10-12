import { store, json, verify } from '../lib/common.mjs';
const TYPES = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' };
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!verify(req)) return json({ error: 'unauthorized' }, 401);
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
  const m = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
  if (!m) return json({ error: 'bad-image' }, 400);
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3.5 * 1024 * 1024) return json({ error: 'too-big' }, 413);
  const name = Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '.' + TYPES[m[1]];
  await store('bee-golden-img').set(name, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), { metadata: { type: m[1] } });
  return json({ url: '/api/img/' + name });
};
export const config = { path: '/api/admin/upload' };
