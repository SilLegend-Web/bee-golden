// Shared helpers for the shop data, admin login and price checks.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

export const store = (name = 'bee-golden') => getStore({ name, consistency: 'strong' });
export const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const key = () => createHmac('sha256', 'bee-golden-admin').update(process.env.ADMIN_PASSWORD || '').digest();
export function sign() {
  const exp = Date.now() + 8 * 3600e3;
  return exp + '.' + createHmac('sha256', key()).update(String(exp)).digest('hex');
}
export function verify(req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const [exp, sig] = t.split('.');
  if (!exp || !sig || !process.env.ADMIN_PASSWORD || +exp < Date.now()) return false;
  const good = createHmac('sha256', key()).update(exp).digest('hex');
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
export function passOk(p) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const h = (v) => createHmac('sha256', 'pw').update(String(v ?? '')).digest();
  return timingSafeEqual(h(p), h(process.env.ADMIN_PASSWORD));
}

// ---- cleaning: only known fields, safe text, safe image paths ----
const T = (v, n) => String(v ?? '').replace(/[<>"`\u0000-\u001f]/g, '').trim().slice(0, n);
const N = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const U = (v) => { v = String(v || ''); return /^\/(media|api\/img)\/[\w./-]{1,160}$/.test(v) ? v : ''; };
export function clean(d) {
  d = d && typeof d === 'object' ? d : {};
  const ids = new Set(), products = [];
  for (const p of (Array.isArray(d.products) ? d.products : []).slice(0, 60)) {
    const id = String((p && p.id) || '').replace(/[^\w-]/g, '').slice(0, 24);
    if (!id || ids.has(id)) continue;
    ids.add(id);
    const m = p.sheetMeta || {};
    products.push({
      id, name: T(p.name, 80) || 'Untitled', cat: T(p.cat, 30) || 'General',
      price: Math.round(N(p.price, 1, 100000, 1) * 100) / 100, desc: T(p.desc, 400), tag: T(p.tag, 20),
      img: U(p.img), cut: U(p.cut), sheet: U(p.sheet),
      sheetMeta: { c: N(m.c, 1, 12, 8) | 0, r: N(m.r, 1, 12, 5) | 0, n: N(m.n, 1, 144, 40) | 0 },
      full: !!p.full, vis: p.vis !== false, sold: !!p.sold,
    });
  }
  const pick = (a, max) => (Array.isArray(a) ? a : []).filter((x) => ids.has(x)).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, max);
  const s = d.settings || {};
  const geo = (v) => (v === null || v === '' || v === undefined || !Number.isFinite(+v) ? null : +v);
  const maps = String(s.mapsUrl || '');
  return {
    products,
    hero: pick(d.hero, 4),
    runway: pick(d.runway, 5),
    lookbook: (Array.isArray(d.lookbook) ? d.lookbook : []).filter((x) => x && ids.has(x.id)).slice(0, 4).map((x) => ({ id: x.id, title: T(x.title, 30) })),
    settings: {
      fee: N(s.fee, 0, 1000, 25), phone: T(s.phone, 30), wa: String(s.wa || '').replace(/\D/g, '').slice(0, 15),
      email: T(s.email, 80), address: T(s.address, 160), hours: T(s.hours, 80),
      lat: geo(s.lat), lng: geo(s.lng), mapsUrl: /^https:\/\/[^\s"<>]{3,190}$/.test(maps) ? maps : '',
      banner: (Array.isArray(s.banner) ? s.banner : []).map((x) => T(x, 60)).filter(Boolean).slice(0, 6),
    },
    updated: new Date().toISOString(),
  };
}
