import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { buildV2, v2Source, v2MediaPaths } from '../scripts/build-v2.mjs';
import { createV2Server } from '../scripts/serve-v2.mjs';
import { root } from '../scripts/build.mjs';

test('V2 has stable correct identity/grades, with the original reference presentation layers', async () => {
  const html = await readFile(path.join(v2Source, 'index.html'), 'utf8');
  const concept = await readFile(path.join(v2Source, 'concept.js'), 'utf8');
  const enhancements = await readFile(path.join(v2Source, 'v2.js'), 'utf8');
  assert.match(html, /Vardhaman Academy/);
  assert.match(html, /Classes 5–10/);
  assert.doesNotMatch(html, /Vardhman|VARDHMAN|Classes? (1[–-]|[1-4] through)|Class 4–7|Class 8–10/);
  assert.match(concept, /for\(let i=5;i<=10;i\+\+\)/);
  assert.match(concept, /Math.max\(5,Math.min\(10,g\)\)/);
  assert.doesNotMatch(concept, /milestones=\{1:/);
  assert.doesNotMatch(enhancements, /if\(index<4\)|gradeBtns.slice\(0,4\)/);
  for (const file of ['base.css', 'v2.css', 'concept.js', 'v2.js', 'fonts.css']) assert.ok(html.includes(`./${file}`));
  assert.doesNotMatch(html, /https:\/\/fonts\.|wa\.me|youtube\.com|gtag|<form/);
});

test('V2 source preserves illustrative stories, demo enquiry, exact logo crop and media paths', async () => {
  const html = await readFile(path.join(v2Source, 'index.html'), 'utf8');
  const styles = await readFile(path.join(v2Source, 'v2.css'), 'utf8');
  const script = await readFile(path.join(v2Source, 'v2.js'), 'utf8');
  assert.match(html, /illustrative sample content, not verified alumni testimonials/);
  assert.match(html, /Interactive demo · no details sent/);
  assert.match(html, /id="childNote"/);
  assert.doesNotMatch(html, /type="(email|tel)"|name="(email|phone)"/);
  assert.match(styles, /background-position: -152px -20px/);
  assert.match(styles, /background-size: 580px 580px/);
  assert.match(script, /External event, not hosted by Vardhaman Academy/);
  for (const file of v2MediaPaths) await stat(path.join(root, 'media', 'vardhaman', file));
  assert.match(styles, /prefers-reduced-motion/);
});

test('V2 build requires explicit private review and cannot produce a production release', async () => {
  await assert.rejects(buildV2(), /not cleared for production/);
  const previousNodeEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    await assert.rejects(buildV2({ privateReview: true }), /not cleared for production/);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
  const result = await buildV2({ privateReview: true });
  assert.equal(path.basename(result.output), '.local-preview-v2');
  assert.match(result.html, /noindex, nofollow/);
  assert.equal(await readFile(path.join(result.output, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n');
});

test('V2 serves selected originals on loopback, supports video ranges and rejects uploads/cross-site access', async t => {
  const server = await createV2Server({ port: 0 });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  await page.text();
  assert.ok(page.headers.get('content-security-policy').includes("form-action 'none'"));
  for (const file of v2MediaPaths) {
    const response = await fetch(`${base}/media/${file}`, { method: 'HEAD' });
    assert.equal(response.status, 200, file);
    assert.ok(Number(response.headers.get('content-length')) > 0);
  }
  for (const route of ['/content/media-manifest.json', '/.git/config', '/docs/handoff-v2/README.md', '/media/../package.json', '/missing.png']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
  assert.equal((await fetch(base, { headers: { Origin: 'https://example.org' } })).status, 403);
  assert.equal((await fetch(base, { method: 'POST', body: 'synthetic enquiry' })).status, 405);
  const hostStatus = await new Promise((resolve, reject) => {
    http.get(base, { headers: { Host: 'example.org' } }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject);
  });
  assert.equal(hostStatus, 403);
  const range = await fetch(`${base}/media/video/outdoor-event-vid-04.mp4`, { headers: { Range: 'bytes=0-63' } });
  assert.equal(range.status, 206);
  assert.equal((await range.arrayBuffer()).byteLength, 64);
});
