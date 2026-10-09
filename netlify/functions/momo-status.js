// Asks Paystack whether the customer approved the payment.
exports.handler = async (event) => {
  const send = (o) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  try {
    const ref = encodeURIComponent((event.queryStringParameters || {}).ref || '');
    const res = await fetch('https://api.paystack.co/transaction/verify/' + ref, {
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY },
    });
    const d = await res.json();
    const st = d.data && d.data.status;
    return send({ status: st === 'success' ? 'success' : ['failed', 'abandoned', 'reversed'].includes(st) ? 'failed' : 'pending' });
  } catch (e) {
    return send({ status: 'pending' });
  }
};
