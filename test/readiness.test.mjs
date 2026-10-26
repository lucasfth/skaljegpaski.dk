import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const text = html => html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('homepage contains meaningful raw HTML and a single sequential heading tree', async () => {
  const html = await read('index.html');
  assert.ok(text(html.match(/<main\b[\s\S]*?<\/main>/)[0]).length >= 500);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]));
  levels.forEach((level, i) => assert.ok(i === 0 || level <= levels[i - 1] + 1));
  assert.match(html, /<title>[^<]*skaljegpaski[^<]*ski[^<]*countdown/i);
  const person = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(person.description.length > 20);
  for (const id of ['skiDate', 'shareBtn', 'countdown', 'countdownContainer']) assert.match(html, new RegExp(`id="${id}"`));
});

test('trust pages, sitemap, robots and llms follow their public contracts', async () => {
  for (const page of ['about', 'contact', 'privacy']) {
    const html = await read(`${page}/index.html`);
    assert.ok(text(html.match(/<main\b[\s\S]*?<\/main>/)[0]).length >= 500, page);
    assert.match(html, new RegExp(`rel="canonical" href="https://skaljegpaski.dk/${page}/"`));
    assert.ok((await read(`${page}/index.md`)).startsWith('# '));
  }
  const sitemap = await read('sitemap.xml');
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.equal((sitemap.match(/<url>/g) || []).length, 4);
  assert.equal((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length, 4);
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/skaljegpaski.dk\/sitemap.xml/);
  const llms = await read('llms.txt');
  assert.match(llms, /^# .+\n\n> .+/);
  assert.match(llms, /## When to use this/);
  for (const section of llms.split(/^## .+$/m).slice(1)) {
    for (const line of section.trim().split('\n').filter(Boolean)) assert.match(line, /^- \[.+\]\(https:\/\/.+\)/);
  }
  for (const match of llms.matchAll(/\]\(https:\/\/skaljegpaski.dk([^)]*)\)/g)) {
    const file = match[1].slice(1);
    assert.ok((await read(file)).length > 20, file);
  }
});
