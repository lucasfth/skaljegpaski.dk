import assert from 'node:assert/strict';
const base = process.argv[2] || 'https://skaljegpaski.dk';
let failures = 0, checks = 0;
async function check(label, fn) {
  checks++;
  try { await fn(); console.log(`PASS ${label}`); }
  catch (error) { failures++; console.error(`FAIL ${label}: ${error.message}`); }
}
for (const path of ['/', '/?date=2027-01-29T17:00', '/about/', '/contact/', '/privacy/']) {
  await check(path, async () => {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const body = await response.text();
    assert.match(body, /<h1>/);
    assert.ok(body.length > 500);
  });
}
for (const path of ['/index.md', '/about/index.md', '/contact/index.md', '/privacy/index.md', '/llms.txt', '/sitemap.xml', '/robots.txt', '/404.md']) {
  await check(path, async () => {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.ok(body.length > 20);
    assert.doesNotMatch(body, /<!doctype html/i);
    if (path.endsWith('.md') || path === '/llms.txt') assert.match(body, /^# /);
    if (path === '/sitemap.xml') assert.match(body, /http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9/);
    console.log(`  Content-Type: ${response.headers.get('content-type')}`);
  });
}
await check('real 404 with discovery links', async () => {
  const response = await fetch(new URL('/__agent-static-host-404-check', base), {headers:{Accept:'text/markdown'}});
  assert.equal(response.status, 404);
  assert.match(await response.text(), /llms\.txt|sitemap\.xml/);
});
await check('homepage and assets remain HTTP-cacheable', async () => {
  for (const path of ['/', '/main.js', '/styles.css']) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    const policy = response.headers.get('cache-control') || '';
    assert.doesNotMatch(policy, /no-store|no-cache/);
    assert.match(policy, /max-age=\d+/);
    const etag = response.headers.get('etag');
    assert.ok(etag);
    await response.arrayBuffer();
    const cached = await fetch(new URL(path, base), {headers:{'If-None-Match':etag}});
    assert.equal(cached.status, 304);
    console.log(`  ${path}: ${policy}, conditional request 304`);
  }
});
console.log(`${checks} checks, ${failures} failures; ${base}`);
process.exitCode = failures ? 1 : 0;
