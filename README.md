# Fathima Samrin & Amal Ammattikas — Wedding Invitation

Plain HTML + CSS + JavaScript. No build step, no installs, no frameworks.

## Run
Open `index.html`, or serve the folder (`npx serve .`). To deploy, upload the whole folder
(Vercel, Netlify, Cloudflare Pages, Hostinger...).

## Files
- `index.html` — all sections and text (gate, hero, invitation, families, nikkah, reception, countdown, venue, closing)
- `css/styles.css` — design tokens (champagne / ivory / blush / antique gold / taupe / cream), layout, animations
- `js/config.js` — names, countdown time, venue + Google Maps links, music file
- `js/app.js` — gate open transition, reveals, countdown, music, ambient particles
- `assets/` — `venue.jpg`, `og-image.jpg` (WhatsApp preview), `music.mp3`

Florals, arches and ornaments are SVG drawn inside `index.html` — no stage photo or opening video is used.

## Maps
Buttons use encoded Google Maps URLs. Put confirmed links in `venue.confirmedMapsUrl` / `confirmedDirectionsUrl` in `js/config.js`.

## Music
Silent until a guest taps Open Invitation or the speaker button. Track: `assets/music.mp3` (`musicSrc` in `js/config.js`).
Make sure you have the rights to publish it.

## Fonts (Google Fonts)
Playfair Display (headings), Allura (names), Cormorant Garamond (invitation text), Cinzel (labels), Amiri (Arabic).
