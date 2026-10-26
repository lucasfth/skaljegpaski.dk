import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';

const origin = 'https://skaljegpaski.dk';
const pages = {
  about: {
    title: 'About skaljegpaski.dk',
    paragraphs: [
      'skaljegpaski.dk is a personal project by Lucas Frey Torres Hanson: a playful ski trip countdown, not a travel business. The skiing question always gets an enthusiastic yes. That answer is a joke and encouragement to look forward to a trip; it is not a recommendation about conditions, fitness, weather or mountain safety.',
      'Choose a departure date and time on the homepage. The live countdown updates in your browser, remembers the date on your device and includes it in the URL so friends can open the same departure. Dates have no timezone offset and are interpreted in each visitor\'s local timezone. JavaScript is required for the interactive features, but the explanation and information pages are ordinary HTML.',
      'The project is open source. You can inspect the implementation, report a reproducible problem or suggest an improvement through the public GitHub repository. It does not offer bookings, resort availability, lift passes, snow reports or emergency assistance.'
    ]
  },
  contact: {
    title: 'Contact and project support',
    paragraphs: [
      'Lucas Frey Torres Hanson is the creator of skaljegpaski.dk. For a technical problem or a feature suggestion, use the public GitHub repository linked below. Check existing issues before opening a new report. Describe what you expected, what actually happened, your browser and device, and the steps needed to reproduce the problem. There is no guaranteed response time for this personal project.',
      'Do not post private trip details, your home address, account credentials or other sensitive information in a public issue. If a shared date is needed to reproduce a bug, replace it with an invented example first. Screenshots should hide unrelated browser tabs and personal information. You can also find the creator\'s public profile and contact routes on the portfolio linked below.',
      'This is not a booking service or an emergency contact. The project cannot change reservations, sell tickets, confirm snow conditions or provide rescue assistance. For those requests, contact your travel provider, resort or relevant local emergency service directly.'
    ]
  },
  privacy: {
    title: 'Privacy and browser storage',
    paragraphs: [
      'The countdown runs in your browser. When you choose a departure date, the site stores that value under the skiDate key in localStorage so the same browser can remember it on a later visit. Clearing the date removes that saved value; you can also delete it through your browser\'s site-data settings. The countdown does not require a user account or a server-side trip database.',
      'The departure date is also included in the date query parameter of the page URL. Anyone who receives that link can read the date. URLs can appear in browser history, hosting request logs and tools used to share links, so do not treat a departure link as confidential. A link does not carry a timezone offset: visitors interpret its date and time locally.',
      'The page loads the Space Mono font from Google Fonts, which makes requests to Google\'s font services. The hosting provider also receives ordinary connection information when serving the site, such as an IP address and request details; retention and handling depend on that provider. The checked-in countdown code contains no analytics or advertising scripts. Native sharing or clipboard access occurs when you use the share button. External GitHub and portfolio links have their own privacy practices. For questions, use the contact page.'
    ]
  }
};
const links = '<nav><a href="/">Countdown</a> · <a href="/about/">About</a> · <a href="/contact/">Contact</a> · <a href="/privacy/">Privacy</a> · <a href="https://github.com/lucasfth/skaljegpaski.dk">Source and issues</a> · <a href="https://lucashanson.dk">Creator portfolio</a></nav>';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
for (const [path, page] of Object.entries(pages)) {
  await mkdir(path, { recursive: true });
  await writeFile(`${path}/index.html`, `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title}</title><meta name="description" content="${escape(page.paragraphs[0])}"><link rel="canonical" href="${origin}/${path}/"><link rel="alternate" type="text/markdown" href="/${path}/index.md"><link rel="describedby" href="/llms.txt"><link rel="stylesheet" href="/styles.css"></head><body><main class="info-page"><h1>${page.title}</h1>${page.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}${links}</main></body></html>\n`);
  await writeFile(`${path}/index.md`, `# ${page.title}\n\n${page.paragraphs.join('\n\n')}\n\n[Countdown](${origin}/) | [Contact](${origin}/contact/) | [Source and issues](https://github.com/lucasfth/skaljegpaski.dk) | [Creator portfolio](https://lucashanson.dk)\n`);
}
const home = await readFile('index.html', 'utf8');
const description = home.match(/<details class="site-guide"[\s\S]*?<\/details>/)[0];
const paragraphs = [...description.matchAll(/<p>(.*?)<\/p>/g)].map(m => m[1]);
await writeFile('index.md', `# skaljegpaski.dk | Ski trip countdown\n\n${paragraphs.join('\n\n')}\n\n## How to use the countdown\n\nOpen [the homepage](${origin}/), select a departure date and time, and use the share button. A shareable example is ${origin}/?date=2027-02-01T17%3A00. The date uses the visitor's local timezone. The live countdown is computed in JavaScript, not in this Markdown response.\n\n[About](${origin}/about/index.md) | [Contact](${origin}/contact/index.md) | [Privacy](${origin}/privacy/index.md)\n`);
await writeFile('llms.txt', `# skaljegpaski.dk\n\n> A personal ski trip countdown by Lucas Frey Torres Hanson, with shareable departure dates and local browser storage.\n\nUse this site for a simple countdown to a known departure, not for travel booking, weather, snow conditions or mountain safety. Read-only HTTP GET requests require no authentication. No public booking or countdown API exists.\n\n## When to use this\n\n- [Countdown guide](${origin}/index.md): Use when someone wants a countdown to a ski trip or a shareable departure link. GET / with Accept: text/markdown on a negotiation-capable host, or GET /index.md on static hosting. To configure the interactive browser page, set date=YYYY-MM-DDTHH:mm in the homepage query string, URL-encoded; no timezone offset is stored. Do not report a live countdown from the static Markdown alone.\n\n## Project information\n\n- [About](${origin}/about/index.md): Creator, purpose, capabilities and limitations.\n- [Contact](${origin}/contact/index.md): Public issue reporting and creator contact routes.\n- [Privacy](${origin}/privacy/index.md): Local storage, shared URLs, external font requests and hosting.\n\n## Optional\n\n- [Sitemap](${origin}/sitemap.xml): Canonical indexable HTML pages.\n`);
await writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
// Update this date when indexable page content changes, not on every build.
const lastmod = '2026-10-26';
await writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...Object.keys(pages)].map(p => `  <url><loc>${origin}/${p ? p + '/' : ''}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await writeFile('404.md', '# Page not found\n\nThe requested page does not exist on skaljegpaski.dk. Check the address or visit the [agent guide](https://skaljegpaski.dk/llms.txt), [sitemap](https://skaljegpaski.dk/sitemap.xml) or [homepage](https://skaljegpaski.dk/).\n');
await writeFile('404.html', '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | skaljegpaski.dk</title><link rel="stylesheet" href="/styles.css"></head><body><main class="info-page"><h1>Page not found</h1><p>The requested page does not exist. Check the address or return to the <a href="/">countdown</a>. Agents can use the <a href="/llms.txt">agent guide</a> or <a href="/sitemap.xml">sitemap</a>.</p></main></body></html>\n');
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const path of ['index.html', 'index.md', 'styles.css', 'main.js', 'og-image.png', 'public', 'about', 'contact', 'privacy', 'llms.txt', 'robots.txt', 'sitemap.xml', '404.html', '404.md']) await cp(path, `dist/${path}`, { recursive: true });
console.log('Built static HTML, Markdown, trust pages, discovery files and isolated dist assets.');
