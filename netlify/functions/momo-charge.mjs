// Starts a MoMo charge with Paystack. Prices come from the admin panel data, never from the browser.
import { store, json } from '../lib/common.mjs';
const DEFAULT_PRICES = { p1: 480, p2: 650, p3: 520, p4: 480, p5: 150, p6: 110, p7: 160 };
const PROVIDER = { 'MTN MoMo': 'mtn', 'Telecel Cash': 'vod', 'AirtelTigo Money': 'atl' };

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);
  try {
    const o = await req.json();
    let data = null;
    try { data = await store().get('site', { type: 'json' }); } catch (e) {}
    const price = (id) => {
      if (!data) return DEFAULT_PRICES[id];
      const p = data.products.find((x) => x.id === id && x.vis !== false && !x.sold);
      return p ? p.price : undefined;
    };
    const fee = data && data.settings && Number.isFinite(+data.settings.fee) ? +data.settings.fee : 25;
    const items = Array.isArray(o.items) ? o.items : [];
    const sub = items.reduce((a, x) => a + price(String(x.id)) * Math.max(1, Math.floor(x.q)), 0);
    const total = sub + (o.delivery === 'd' ? fee : 0);
    const provider = PROVIDER[o.network];
    if (!items.length || !Number.isFinite(total) || !provider || !/^0\d{9}$/.test(o.momo || '') || !/^\S+@\S+\.\S+$/.test(o.email || ''))
      return json({ ok: false, message: 'Please check your details and try again.' });
    const ref = 'BG-' + Date.now().toString(36).toUpperCase();
    const res = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: o.email, amount: Math.round(total * 100), currency: 'GHS', reference: ref,
        mobile_money: { phone: o.momo, provider },
        metadata: { name: o.name, delivery: o.delivery, address: o.address, items: items.map((x) => `${x.q}x ${x.n} (${x.s})`).join(', ') },
      }),
    });
    const d = await res.json();
    if (!d.status) return json({ ok: false, message: d.message || 'Payment could not start.' });
    return json({ ok: true, ref, status: d.data.status, message: d.data.display_text });
  } catch (e) {
    return json({ ok: false, message: 'Payment could not start.' });
  }
};
export const config = { path: '/api/momo/charge' };
