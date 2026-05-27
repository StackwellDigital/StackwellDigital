# Website Audit Worker Deployment Guide

## What You Have

Three files:
1. **audit-worker.js** — The Cloudflare Worker code (fetches URLs server-side, runs checks, returns JSON)
2. **wrangler.toml** — Configuration file for Wrangler CLI
3. **audit.html** — The standalone audit page (calls the Worker)

## Deployment Steps

### 1. Install Wrangler (if you don't have it)
```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare
```bash
wrangler login
```
This opens a browser to authorize your Cloudflare account.

### 3. Deploy the Worker
```bash
wrangler deploy audit-worker.js
```

Wrangler reads `wrangler.toml` and deploys to `audit-stackwell.adam-8d6.workers.dev`.

**Wait for success message.** You should see:
```
✨ Uploaded audit-stackwell
✨ Your worker is published at: https://audit-stackwell.adam-8d6.workers.dev
```

### 4. Test the Worker (optional)
```bash
curl -X POST https://audit-stackwell.adam-8d6.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"url":"https://stackwell.digital"}'
```

Should return JSON with audit results.

### 5. Deploy the Audit Page
You have two options:

**Option A: Deploy to Cloudflare Pages**
- Create a GitHub repo called `audit-stackwell` in StackwellDigital org
- Push `audit.html` to the repo (as `index.html`)
- Connect to Cloudflare Pages
- Custom domain: `audit.stackwell.digital`

**Option B: Host standalone**
- Upload `audit.html` to your web server
- Access at: `https://yourserver.com/audit.html`

**Option C: Test locally**
- Open `audit.html` in your browser
- The Worker endpoint is already baked in

---

## How It Works

1. User enters URL in the audit page
2. Form POSTs to `audit-stackwell.adam-8d6.workers.dev`
3. Worker fetches the page, parses HTML, runs checks
4. Returns JSON with results (https, title, meta, h1, viewport, favicon, openGraph, etc.)
5. Front-end renders the grade card + issues list
6. Data is stored in sessionStorage for the contact form

---

## What the Worker Checks

- **HTTPS** — Is the site secure?
- **Title Tag** — Does it have one?
- **Meta Description** — SEO snippet present?
- **H1 Heading** — Main heading exists?
- **Viewport Meta Tag** — Mobile responsive?
- **Favicon** — Branding icon present?
- **Canonical Tag** — Duplicate content handling?
- **Open Graph / Twitter Tags** — Social sharing configured?
- **Load Time** — How fast does it load?

---

## Grading

- **A** = 90%+ checks passing
- **B** = 80-89%
- **C** = 70-79%
- **D** = 60-69%
- **F** = <60%

---

## Next Steps

After deployment:
1. Test it with a few URLs (your site, competitors, clients)
2. Integrate into main stackwell.digital as a section
3. Add contact form integration (pre-fill with audit URL + results)
4. Track which types of sites tend to get which grades

---

## Troubleshooting

**Worker returns 403 or timeout?**
- Cloudflare might be blocking the fetch. Check Worker logs: `wrangler tail`

**CORS errors on the page?**
- The Worker has CORS headers. Make sure they're being returned. Check browser console.

**Can't fetch a particular site?**
- Some sites block programmatic access. Worker tries a User-Agent header to mimic browser. If that fails, return error message.

**Grading seems off?**
- Check the `renderResults` function. Total checks should match the checks you're running in the Worker.

---

## Files Ready to Deploy

- `/home/claude/audit-worker.js` — Ready to deploy
- `/home/claude/wrangler.toml` — Ready to use
- `/home/claude/audit.html` — Ready to test/deploy
