<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/hbit-mark-warm-on-dark.svg" />
    <img src="./public/hbit-mark-warm-on-light.svg" alt="hbit logo" width="64" />
  </picture>

  <h1>Skal jeg på ski?</h1>

  <p>A tiny Danish countdown for the next ski trip.</p>

  <p>
    <a href="https://skaljegpaski.dk"><strong>Open website ↗</strong></a>
  </p>

  <p>
    <img alt="MIT License" src="https://img.shields.io/github/license/lucasfth/skaljegpaski.dk?style=flat-square" />
    <img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white" />
    <img alt="CSS" src="https://img.shields.io/badge/CSS-663399?style=flat-square&logo=css&logoColor=white" />
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  </p>
</div>

## 01 · About

Should I go skiing? The answer is always **JA**.

Pick a departure date and time to start a live countdown. The site adds the date to the URL for sharing and saves it in your browser for the next visit.

## 02 · Features

- Live countdown in Danish
- Shareable dates through the `date` URL parameter
- Local date persistence using `localStorage`
- Native device sharing with a clipboard fallback
- Responsive, dependency-free HTML, CSS, and JavaScript

## 03 · Run locally

No dependencies. No build step.

```bash
git clone git@github.com:lucasfth/skaljegpaski.dk.git
cd skaljegpaski.dk
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## 04 · Agent readiness and verification

The countdown JavaScript is unchanged. The homepage adds an accessible, collapsed
information disclosure; the original night-sky styling and countdown remain.
About, contact and privacy pages are real static HTML with Markdown equivalents.
Edit informational copy in `scripts/build.mjs`, then regenerate it. Update its
`lastmod` constant when indexable content changes. Do not use build timestamps as
content modification dates.

```bash
npm run build
npm test
npm start
# In another terminal:
node scripts/verify.mjs http://127.0.0.1:8793
```

Node 22 or later is required for these development checks. The site itself remains
static and dependency-free. `npm start` downloads Wrangler 4 through npx for a
local Cloudflare Workers runtime; it does not publish or change DNS.

### Hosting limitation and publication

The current production host is GitHub Pages. It can serve the checked-in HTML,
Markdown siblings, llms.txt, robots.txt, sitemap and custom HTML 404, but cannot
choose a representation from the Accept header or set `Vary: Accept`. Separate
`.md` URLs alone do not satisfy homepage negotiation or negotiated 404 checks.

`wrangler.json` and `src/worker.mjs` provide an optional Workers Assets deployment.
Every request reaches the Worker. It negotiates HTML/Markdown with q-values,
returns 406 when neither is acceptable, preserves real 404 statuses, and sets
`Vary: Accept`. Negotiated responses use no-store to avoid representation mixing.
Only an explicit asset allowlist is exposed; source and test files are excluded.

Publication requires approval to push this repository. Full negotiation also
requires an approved hosting cutover plus Cloudflare account/domain access or
another programmable edge host. No DNS, hosting, repository, or account changes
are performed by the build. After an authorized deployment, run:

```bash
node scripts/verify.mjs https://skaljegpaski.dk
curl -sS -L -i -H 'Accept: text/markdown' https://skaljegpaski.dk/
curl -sS -L -i -H 'Accept: text/html' https://skaljegpaski.dk/
curl -sS -L -i -H 'Accept: text/markdown' https://skaljegpaski.dk/some-path-that-does-not-exist
```

Verify both final status and response body, not headers alone. The verifier is
strict: GitHub Pages will not pass its negotiation checks.

### Remaining product decisions

- Confirm the public support route. The contact page uses the existing GitHub
  repository and creator portfolio, not an invented email address or business.
- Review the factual privacy description after any host, fonts, tracking or
  storage changes. It describes the current source, not unverified legal claims.
- Brand metadata is improved, but search placement is not guaranteed. A domain
  owner can submit the sitemap in Search Console and request indexing. Genuine
  relevant links and mentions require outreach, not code.
- Re-run the external readiness audit after publication; no new score is claimed.
- Browser rendering and visual parity require a separate real-browser review.
  Unit and HTTP tests do not establish visual acceptance.

## 05 · License

Licensed under the [MIT License](./LICENSE).
