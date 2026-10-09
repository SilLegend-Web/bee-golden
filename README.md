# Bee Golden Collections: go live with MoMo

1. Paystack: create a Ghana business account, then copy your TEST secret key (sk_test_...) from Settings > API Keys. Test first; switch to the live key only after a test order works.
2. Install Node.js, then in this folder run:
   npm i -g netlify-cli
   netlify login
   netlify init
   netlify env:set PAYSTACK_SECRET_KEY sk_test_xxxxxxxx
   netlify deploy --prod
3. Open your Netlify link and place a test order.
4. For real sales: run `netlify env:set PAYSTACK_SECRET_KEY sk_live_xxxxxxxx`, then `netlify deploy --prod` again.

Never paste the secret key into index.html. Prices are checked on the server: if you change a price in index.html, change the PRICES list in netlify/functions/momo-charge.js too (same order).
Orders show in your Paystack dashboard with the customer's name, address and items.
