import { json, passOk, sign } from '../lib/common.mjs';
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!process.env.ADMIN_PASSWORD) return json({ error: 'not-configured' }, 503);
  let b = {};
  try { b = await req.json(); } catch (e) {}
  if (!passOk(b.password)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: 'wrong-password' }, 401);
  }
  return json({ token: sign() });
};
export const config = { path: '/api/admin/login' };
