import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the actual Worker with a filesystem-backed assets binding.
const assets = { async fetch(request) {
  const path = new URL(request.url).pathname;
  try {
    const body = await readFile(new URL(`../dist${path}`, import.meta.url));
    const ext = path.split('.').pop();
    return new Response(body, { headers: { 'Content-Type': ({html:'text/html',md:'text/markdown',css:'text/css',js:'text/javascript',txt:'text/plain',xml:'application/xml',png:'image/png',svg:'image/svg+xml',ico:'image/x-icon'})[ext] || 'application/octet-stream', 'Vary': 'Accept-Encoding' } });
  } catch { return new Response('missing', { status: 404 }); }
}};
const run = async (path, accept, method = 'GET') => {
  const { default: worker } = await import('../src/worker.mjs');
  return worker.fetch(new Request(`https://skaljegpaski.dk${path}`, { method, headers: accept === undefined ? {} : { Accept: accept } }), { ASSETS: assets });
};

test('homepage negotiates HTML and Markdown with quality, wildcards and exclusions', async () => {
  for (const [accept, expected] of [
    [undefined,'text/html'], ['*/*','text/html'], ['text/html','text/html'],
    ['text/markdown','text/markdown'], ['text/markdown, text/html, */*','text/markdown'],
    ['text/markdown;q=0.2, text/html;q=0.9','text/html'],
    ['text/html;q=0, */*;q=1','text/markdown'],
    ['text/markdown;q=0, text/*;q=0.8','text/html'],
    ['TEXT/MARKDOWN; Q=0.9, text/html;q=0.1','text/markdown'],
    ['application/json',null], ['text/html;q=0, text/markdown;q=0',null],
    ['text/markdown;variant=unknown, text/html;q=0.5','text/html']
  ]) {
    const response = await run('/', accept);
    assert.equal(response.status, expected ? 200 : 406, accept);
    assert.ok(response.headers.get('vary').toLowerCase().split(/,\s*/).includes('accept'));
    if (expected) {
      assert.ok(response.headers.get('content-type').startsWith(expected), accept);
      assert.match(response.headers.get('link'), /rel="describedby"/);
      assert.match(await response.text(), expected === 'text/markdown' ? /^# / : /<!DOCTYPE html>/i);
    }
  }
});

test('unknown paths return negotiated 404 bodies, never homepage or 200', async () => {
  for (const path of ['/missing', '/missing.html', '/missing.md', '/missing.png', '/deep/missing/']) {
    for (const type of ['text/markdown','text/html']) {
      const response = await run(path, type);
      assert.equal(response.status, 404, path);
      assert.ok(response.headers.get('content-type').startsWith(type));
      const body = await response.text();
      assert.ok(body.length > 20);
      assert.match(body, /llms.txt/);
      if (type === 'text/markdown') assert.match(body, /^# Page not found/);
    }
  }
});

test('every public document, alias and asset is reachable; HEAD has no body', async () => {
  for (const path of ['/', '/index.html', '/about', '/about/', '/contact/', '/privacy/']) {
    for (const type of ['text/html','text/markdown']) {
      const response = await run(path, type);
      assert.equal(response.status, 200, path);
      assert.ok(response.headers.get('content-type').startsWith(type));
    }
  }
  for (const path of ['/index.md','/about/index.md','/contact/index.md','/privacy/index.md','/llms.txt','/sitemap.xml','/robots.txt','/styles.css','/main.js','/og-image.png','/public/favicon.ico','/404.md']) {
    const response = await run(path);
    assert.equal(response.status, 200, path);
    assert.ok((await response.arrayBuffer()).byteLength > 20);
  }
  for (const path of ['/', '/missing', '/styles.css']) {
    assert.equal(await (await run(path, 'text/markdown', 'HEAD')).text(), '');
  }
  assert.equal((await run('/', '*/*', 'POST')).status, 405);
});
