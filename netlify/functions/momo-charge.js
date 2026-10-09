// Starts a MoMo charge with Paystack. The price is recalculated here so a customer cannot change it in the browser.
// PRICES must match the product order (and prices) in index.html.
const PRICES = [480, 650, 520, 480, 150, 110, 160];
const FEE = 25;
const PROVIDER = { 'MTN MoMo': 'mtn', 'Telecel Cash': 'vod', 'AirtelTigo Money': 'atl' };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const send = (o) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  try {
    const o = JSON.parse(event.body || '{}');
    const items = Array.isArray(o.items) ? o.items : [];
    const sub = items.reduce((a, x) => a + PRICES[x.i] * Math.max(1, Math.floor(x.q)), 0);
    const total = sub + (o.delivery === 'd' ? FEE : 0);
    const provider = PROVIDER[o.network];
    if (!items.length || !Number.isFinite(total) || !provider || !/^0\d{9}$/.test(o.momo || '') || !/^\S+@\S+\.\S+$/.test(o.email || ''))
      return send({ ok: false, message: 'Please check your details and try again.' });
    const ref = 'BG-' + Date.now().toString(36).toUpperCase();
    const res = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: o.email, amount: Math.round(total * 100), currency: 'GHS', reference: ref,
        mobile_money: { phone: o.momo, provider },
        metadata: { name: o.name, delivery: o.delivery, address: o.address, items: items.map(x => `${x.q}x ${x.n} (${x.s})`).join(', ') },
      }),
    });
    const d = await res.json();
    if (!d.status) return send({ ok: false, message: d.message || 'Payment could not start.' });
    return send({ ok: true, ref, status: d.data.status, message: d.data.display_text });
  } catch (e) {
    return send({ ok: false, message: 'Payment could not start.' });
  }
};
