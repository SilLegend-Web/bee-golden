import { store, json, verify, clean } from '../lib/common.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!verify(req)) return json({ error: 'unauthorized' }, 401);
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
  const data = clean(b);
  if (!data.products.length) return json({ error: 'no-products' }, 400);
  const s = store();
  try { const prev = await s.get('site', { type: 'json' }); if (prev) await s.setJSON('site-prev', prev); } catch (e) {}
  await s.setJSON('site', data);
  return json({ ok: true, updated: data.updated, products: data.products.length });
};
export const config = { path: '/api/admin/save' };
