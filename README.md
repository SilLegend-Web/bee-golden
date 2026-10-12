# Bee Golden Collections: website, payments and admin panel

## What is in this folder
- index.html, shop.html, about.html, contact.html : the website pages
- admin.html : the admin panel (open yoursite.netlify.app/admin.html)
- media/ : product photos, transparent images and 360-degree turntable images
- data/default.json : the starting catalogue, showcase and settings
- netlify/functions/ and netlify/lib/ : the server files (payments, admin login, saving, image upload)
- package.json, netlify.toml : settings Netlify reads

## Updating your GitHub repository (one time)
1. In GitHub, open your repository, go to netlify/functions and DELETE the old file momo-charge.js
   (open it, click the bin icon, commit). The new one is momo-charge.mjs. Keeping both breaks the deploy.
2. Click Add file > Upload files and drag in EVERYTHING from this folder (all pages, admin.html,
   media, data, netlify, package.json, netlify.toml). Commit. Netlify redeploys by itself.

## Netlify settings (Site configuration > Environment variables)
- PAYSTACK_SECRET_KEY : your Paystack secret key (already set)
- ADMIN_PASSWORD : a long password only you know (NEW). Then Deploys > Trigger deploy > Deploy project without cache.

## Using the admin panel
Open /admin.html, log in, change things, press Save changes, then refresh the website.
Products, prices, sold-out and hidden items, the hero, runway and Lookbook choices, contact details,
delivery fee, map location and the shop banner are all managed there.
The payment system reads the same saved prices, so customers always pay what the shop shows.

## Good to know
- Hero pieces look best with a transparent (background-removed) image. Without one, the photo is shown.
- Runway pieces turn 360 degrees only with a turntable image; otherwise they show as a framed photo.
- To change the admin password, change ADMIN_PASSWORD in Netlify and deploy again.
