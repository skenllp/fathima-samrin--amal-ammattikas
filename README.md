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
- `assets/` — `bg-*.webp` backgrounds, `fonts/`, `venue.jpg`, `og-image.jpg` (WhatsApp preview), `music.mp3`

The Nikkah section and the venue date/time block are commented out in `index.html`; remove the comment markers to restore them.

## Maps
Buttons use encoded Google Maps URLs. Put confirmed links in `venue.confirmedMapsUrl` / `confirmedDirectionsUrl` in `js/config.js`.

## Music
Silent until a guest taps Open Invitation or the speaker button. Track: `assets/music.mp3` (`musicSrc` in `js/config.js`).
Make sure you have the rights to publish it.

## Fonts (self-hosted in assets/fonts — no external requests)
Trajan Pro (Regular + Bold) for all Latin text, including the couple's names; Amiri (bismillah only, subset) for the Arabic line in the hero.
Trajan Pro is a commercial Adobe font — make sure your licence covers website use.
The couple's names are auto-fitted to one line (`data-fit` in `index.html`, `fitNames()` in `js/app.js`).
The Nikkah section, the Nikkah entry in the reception block and the venue date/time block are commented out in `index.html`.
