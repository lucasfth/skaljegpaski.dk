import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:8793';
let failures = 0;
async function check(label, fn) {
  try { await fn(); console.log(`PASS ${label}`); }
  catch (error) { failures++; console.error(`FAIL ${label}: ${error.message}`); }
}
for (const path of ['/', '/about', '/contact', '/privacy']) {
  for (const type of ['text/html', 'text/markdown']) {
    await check(`${path} ${type}`, async () => {
      const response = await fetch(new URL(path, base), { headers:{ Accept:type } });
      assert.equal(response.status, 200);
      assert.ok(response.headers.get('content-type')?.startsWith(type));
      assert.match(response.headers.get('vary') || '', /\bAccept\b/i);
      const body = await response.text();
      assert.ok(body.length >= 500);
      assert.match(body, type === 'text/markdown' ? /^# / : /<h1>/);
    });
  }
}
for (const [path, type] of [['/index.md','text/markdown'],['/about/index.md','text/markdown'],['/contact/index.md','text/markdown'],['/privacy/index.md','text/markdown'],['/llms.txt','text/plain'],['/sitemap.xml','application/xml'],['/robots.txt','text/plain']]) {
  await check(path, async () => {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type')?.startsWith(type));
    assert.ok((await response.text()).length > 20);
  });
}
await check('Markdown 404', async () => {
  const response = await fetch(new URL('/__ora-404-probe-agent-readiness', base), {headers:{Accept:'text/markdown'}});
  assert.equal(response.status, 404);
  assert.ok(response.headers.get('content-type')?.startsWith('text/markdown'));
  const body = await response.text();
  assert.ok(body.length >= 20);
  assert.match(body, /\[.+\]\(.+(?:llms.txt|sitemap.xml).*\)/);
});
console.log(`Verification target: ${base}; failed checks: ${failures}`);
process.exitCode = failures ? 1 : 0;
