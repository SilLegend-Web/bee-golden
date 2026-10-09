// Submits the code a customer received (some networks ask for one).
exports.handler = async (event) => {
  const send = (o) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  try {
    const { ref, otp } = JSON.parse(event.body || '{}');
    const res = await fetch('https://api.paystack.co/charge/submit_otp', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, reference: ref }),
    });
    const d = await res.json();
    if (!d.status) return send({ ok: false, message: d.message || 'That code was not accepted.' });
    return send({ ok: true, status: d.data.status, message: d.data.display_text });
  } catch (e) {
    return send({ ok: false, message: 'Could not submit the code.' });
  }
};
