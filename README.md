# Fathima Samrin & Amal Ammattikas — Wedding Invitation

Plain HTML + CSS + JavaScript. No build step, no installs.

## Run
Open `index.html` in a browser, or serve the folder (`npx serve .` / any static host).
To deploy, upload the whole folder (Vercel, Netlify, Cloudflare Pages, Hostinger...).

## Files
- `index.html` — all sections and text
- `css/styles.css` — styling
- `js/config.js` — names, countdown time, venue + Google Maps links, music file, wishes backend
- `js/app.js` — intro video, reveal animations, countdown, wishes form, music
- `assets/` — curtain-opening.mp4, ballroom-stage.png, floral-arch.png

## Maps
Buttons use encoded Google Maps search/directions URLs. Put confirmed links in
`venue.confirmedMapsUrl` / `confirmedDirectionsUrl` in `js/config.js`.

## Music
Silent unless a guest taps the speaker. The track is `assets/music.mp3` (set in `musicSrc` in `js/config.js`).
Make sure you have the rights to publish it before sharing the site publicly.

## Wishes
No backend configured -> labelled demo mode (saved only in that browser, never delivered).
- Supabase: set `supabaseUrl` and `supabaseAnonKey` in `js/config.js`, and run:
```sql
create table wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  message text not null check (char_length(message) between 5 and 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table wishes enable row level security;
create policy "anyone can submit" on wishes for insert to anon with check (approved = false);
create policy "read approved" on wishes for select to anon using (approved = true);
```
Set `approved = true` in the dashboard to show a wish on the site.
- Apps Script / custom endpoint: set `endpoint`; it receives a POST with a JSON string `{"name","message"}`.

## Fonts
Google Fonts stand-ins: Cinzel (Trajan Pro), Great Vibes (BeautyHandwriting), Cormorant Garamond, Amiri.
If you own the originals, add `@font-face` rules in `css/styles.css`; the font stacks already list them first.
