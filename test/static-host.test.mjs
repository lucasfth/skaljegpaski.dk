import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
test('agent guidance describes GitHub Pages honestly and preserves cacheable static assets', async () => {
  const guide = await read('llms.txt');
  assert.match(guide, /GitHub Pages/);
  assert.doesNotMatch(guide, /negotiation-capable host/);
  assert.match(guide, /URL date takes precedence/);
  assert.match(guide, /localStorage/);
  assert.match(guide, /Accept.*does not/i);
  const home = await read('index.html');
  assert.match(home, /href="styles.css"/);
  assert.match(home, /src="main.js"/);
  assert.doesNotMatch(home, /(?:main.js|styles.css)\?/);
  assert.doesNotMatch(home, /http-equiv="(?:cache-control|expires|pragma)"/i);
  const build = await read('scripts/build.mjs');
  assert.doesNotMatch(build, /Date\.now|new Date/);
  await assert.rejects(access(new URL('../wrangler.json', import.meta.url)));
});
