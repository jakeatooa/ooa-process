# Deploying "Process" to Netlify

## What this is
A static HTML/CSS/JS site — no build step, no server, no accounts. All user
responses live only in the visitor's own browser (`localStorage`).

## Files that make up the site
- `index.html` — app shell + metadata
- `app.js` — session flow, storage, sharing
- `cards.js` — all 60 prompts across 6 categories
- `synthesis.js` — local TF-IDF + key-quote analysis
- `styles.css` — all styling
- `assets/` — 120 card PNGs + front-matter art
- `netlify.toml` — caching + security headers
- `site.webmanifest` — home-screen install metadata
- `robots.txt` — crawler access

## Deploy via drag-and-drop (no Git needed)
1. Sign in at https://app.netlify.com
2. Click **Add new site → Deploy manually**
3. Drag the entire `OOA_Card Game` folder onto the drop zone
4. Netlify assigns a URL like `https://<random-name>.netlify.app`
5. In **Site configuration → Change site name** set it to
   `ooa-process` → URL becomes `https://ooa-process.netlify.app`

## Post-deploy checklist
- [ ] Open the URL in Chrome and mobile Safari
- [ ] Run through Quick Pull + Process Session end-to-end
- [ ] Verify all card images load (DevTools → Network, no 404s)
- [ ] Verify "Copy as Text" works
- [ ] Verify "Download Image" works
- [ ] Paste the URL in Slack/email and confirm the OG preview card renders
- [ ] Run Lighthouse → Accessibility + Best Practices (target ≥ 90)

## Adding a custom domain later
1. Netlify → **Domain management → Add a domain**
2. Enter `process.outofarchitecture.com`
3. Create a `CNAME` record at your DNS provider pointing to the Netlify URL
4. Netlify auto-provisions an SSL cert
5. Re-test the OG preview with the new URL

## Sharing from Circle + Squarespace
- **Circle:** create a post or sidebar link titled "Process — a career
  reflection deck" with the URL and a short description.
- **Squarespace:** add a nav item or button linking to the Netlify URL
  with `target="_blank" rel="noopener"`.

## Updating the site later
Re-drag the folder onto Netlify (same site), or connect the folder to a
Git repo for continuous deploys.
