// RFC 9110: a candidate's most specific matching range determines its quality.
export function preferredType(header) {
  const types = ['text/html', 'text/markdown'];
  if (!header?.trim()) return types[0];
  const ranges = header.split(',').map((part, position) => {
    const [rawType, ...params] = part.trim().toLowerCase().split(';').map(p => p.trim());
    let q = 1;
    let parameterized = false;
    for (const param of params) {
      if (param.startsWith('q=')) {
        q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(param.slice(2)) ? Number(param.slice(2)) : 0;
        break; // Parameters after q are Accept extensions, not media parameters.
      }
      // Only charset=utf-8 is a supported representation parameter.
      if (param !== 'charset=utf-8' && param !== 'charset="utf-8"') parameterized = true;
    }
    return { type: rawType, q, position, parameterized, specificity: rawType === '*/*' ? 0 : rawType.endsWith('/*') ? 1 : 2 };
  });
  const candidates = types.map(type => {
    const match = ranges.filter(r => !r.parameterized && (r.type === type || r.type === 'text/*' || r.type === '*/*'))
      .sort((a, b) => b.specificity - a.specificity || a.position - b.position)[0];
    return { type, q: match?.q ?? 0, position: match?.position ?? Infinity };
  }).filter(c => c.q > 0).sort((a, b) => b.q - a.q || a.position - b.position);
  return candidates[0]?.type ?? null;
}

const documents = new Map([
  ['/', '/index'], ['/index.html', '/index'],
  ...['about', 'contact', 'privacy'].flatMap(page => [
    [`/${page}`, `/${page}/index`], [`/${page}/`, `/${page}/index`], [`/${page}/index.html`, `/${page}/index`]
  ])
]);
const files = new Set(['/index.md', '/about/index.md', '/contact/index.md', '/privacy/index.md', '/llms.txt', '/robots.txt', '/sitemap.xml', '/styles.css', '/main.js', '/og-image.png', '/404.html', '/404.md', '/public/apple-touch-icon.png', '/public/favicon-16x16.png', '/public/favicon-32x32.png', '/public/favicon.ico', '/public/hbit-mark-warm-on-dark.svg', '/public/hbit-mark-warm-on-light.svg']);

export default {
  async fetch(request, env) {
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed\n', { status: 405, headers: { Allow: 'GET, HEAD' } });
    const url = new URL(request.url);
    const document = documents.get(url.pathname);
    const direct = files.has(url.pathname);
    const type = direct ? null : preferredType(request.headers.get('accept'));
    if (!direct && !type) return new Response(request.method === 'HEAD' ? null : 'Not acceptable. Available types: text/html, text/markdown.\n', { status: 406, headers: { 'Content-Type': 'text/plain; charset=utf-8', Vary: 'Accept', 'Cache-Control': 'no-store' } });
    const missing = !document && !direct;
    const path = direct ? url.pathname : missing ? `/404.${type === 'text/markdown' ? 'md' : 'html'}` : `${document}.${type === 'text/markdown' ? 'md' : 'html'}`;
    const assetUrl = new URL(url);
    assetUrl.pathname = path;
    assetUrl.search = '';
    const asset = await env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
    if (asset.status !== 200) return new Response(request.method === 'HEAD' ? null : 'Required site asset is unavailable.\n', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    const headers = new Headers(asset.headers);
    // Never carry a representation-specific entity tag across negotiated URLs.
    headers.delete('etag');
    headers.delete('content-length');
    headers.set('Cache-Control', 'no-store');
    if (!direct) {
      const vary = (headers.get('vary') || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!vary.some(v => v.toLowerCase() === 'accept')) vary.push('Accept');
      headers.set('Vary', vary.join(', '));
      headers.set('Content-Type', `${type}; charset=utf-8`);
      headers.set('Link', `${document ? `<${document}.md>; rel="alternate"; type="text/markdown", ` : ''}</llms.txt>; rel="describedby"`);
    } else if (path.endsWith('.md')) headers.set('Content-Type', 'text/markdown; charset=utf-8');
    else if (path.endsWith('.txt')) headers.set('Content-Type', 'text/plain; charset=utf-8');
    else if (path.endsWith('.xml')) headers.set('Content-Type', 'application/xml; charset=utf-8');
    if (missing || path.startsWith('/404.')) headers.set('X-Robots-Tag', 'noindex');
    return new Response(request.method === 'HEAD' ? null : asset.body, { status: missing ? 404 : 200, headers });
  }
};
