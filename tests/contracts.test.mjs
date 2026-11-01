import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { canPublish, mediaUrl, selectMedia, toCard } from '../src/media.mjs';
import { renderPage } from '../src/sections.mjs';
import { build, readContracts, root } from '../scripts/build.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';

const { content, manifest } = await readContracts();

test('academy identity, current grades, copy, title and contact action match the handoff', () => {
  const html = renderPage(content, manifest.assets, { localReview: true });
  assert.equal(content.academy.name, 'Vardhaman Academy');
  assert.deepEqual(content.academy.grades, [5, 6, 7, 8, 9, 10]);
  assert.ok(html.includes('<title>Vardhaman Academy | Classes 5–10'));
  assert.ok(html.includes(content.hero.body));
  assert.ok(html.includes(content.hero.cta.label));
  assert.ok(html.includes('href="#contact"'));
  assert.doesNotMatch(html, /Vardhman|Classes 1[–-]|XI[–-]XII|100%|80%|<form|wa\.me|youtube\.com/);
});

test('all original manifest paths and inherited video posters exist', async () => {
  for (const asset of manifest.assets) {
    for (const source of [asset.path, asset.poster_path].filter(Boolean)) {
      assert.equal(mediaUrl(source), '/media/vardhaman/' + source.slice(7));
      await access(path.join(root, mediaUrl(source).slice(1)));
    }
    if (asset.type === 'video') {
      assert.equal(asset.poster_path, `assets/video-posters/${asset.id.toLowerCase()}.jpg`);
      assert.equal(toCard(asset).poster, mediaUrl(asset.poster_path));
    }
  }
  for (const invalid of ['../private.mp4', 'assets/../../secret.jpg', 'assets/no file.jpg', '/media/a.png']) {
    assert.throws(() => mediaUrl(invalid));
  }
});

test('public release defaults to deny; private review never admits historical references', () => {
  assert.equal(selectMedia(manifest.assets).length, 0);
  assert.equal(selectMedia(manifest.assets, { privateReview: true }).length, 12);
  assert.ok(selectMedia(manifest.assets, { privateReview: true }).every(asset => asset.publish_status !== 'reference_only'));
  for (const publish_status of [undefined, '', 'approved', 'pending_likeness_approval', 'reference_only', true]) {
    assert.equal(canPublish({ publish_status }), false);
  }
  const futureApproved = { ...manifest.assets[0], publish_status: 'approved_for_public' };
  assert.equal(selectMedia([futureApproved]).length, 1);
  assert.equal(canPublish(futureApproved), true);
});

test('production artifact contains no unapproved media, catalogue entries, review UI or composite URL', async () => {
  const { output, approvedCount } = await build();
  assert.equal(approvedCount, 0);
  assert.deepEqual((await readdir(output)).sort(), ['app.js', 'catalogue.json', 'index.html', 'robots.txt', 'styles.css']);
  assert.deepEqual(JSON.parse(await readFile(path.join(output, 'catalogue.json'), 'utf8')), []);
  const html = await readFile(path.join(output, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /id="private-review"|rushab-warm-hero|<img|guardian_consent|IMG-18/);
  assert.match(html, /Rushab Mutha/);
});

test('local server gates catalogue, original assets and posters; toggle resets and prevents cross-origin access', async t => {
  const server = await createPreviewServer({ port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (route, options) => fetch(base + route, options);
  assert.equal((await request('/')).status, 200);
  assert.equal((await request(mediaUrl(manifest.assets.find(asset => asset.id === 'HERO-A').path))).status, 200);
  assert.deepEqual(await (await request('/catalogue.json')).json(), []);
  const child = '/media/vardhaman/gallery/cricket-img-14.jpeg';
  const poster = '/media/vardhaman/video-posters/vid-04.jpg';
  assert.equal((await request(child)).status, 404);
  assert.equal((await request(child.replace('.jpeg', '.480w.webp'))).status, 404);
  assert.equal((await request(poster)).status, 404);
  assert.equal((await request('/content/media-manifest.json')).status, 404);
  assert.equal((await request('/docs/handoff/APPROVALS.md')).status, 404);
  assert.equal((await request('/__review', { method: 'POST', headers: { Origin: 'http://example.org', 'Content-Type': 'application/json' }, body: '{"enabled":true}' })).status, 403);
  // Fetch normalises Host; use the HTTP client to exercise the server's actual Host guard.
  const foreignHostStatus = await new Promise((resolve, reject) => {
    http.get(base, { headers: { Host: 'example.org' } }, response => {
      response.resume();
      resolve(response.statusCode);
    }).on('error', reject);
  });
  assert.equal(foreignHostStatus, 403);
  const enable = await request('/__review', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"enabled":true}' });
  assert.equal(enable.status, 200);
  const cookie = enable.headers.get('set-cookie').split(';')[0];
  const headers = { Cookie: cookie };
  const cards = await (await request('/catalogue.json', { headers })).json();
  assert.equal(cards.length, 11);
  assert.ok(cards.every(card => !['IMG-01', 'IMG-02', 'IMG-17', 'HERO-A'].includes(card.id)));
  assert.equal((await request(child, { headers })).status, 200);
  assert.equal((await request(child.replace('.jpeg', '.480w.webp'), { headers })).status, 200);
  assert.equal((await request(poster, { headers })).status, 200);
  assert.equal((await request('/media/vardhaman/brand/legacy-brand-poster-img-01.jpeg', { headers })).status, 404);
  const partial = await request('/media/vardhaman/video/outdoor-event-vid-04.mp4', { headers: { ...headers, Range: 'bytes=0-99' } });
  assert.equal(partial.status, 206);
  assert.equal((await partial.arrayBuffer()).byteLength, 100);
  assert.equal((await request('/media/vardhaman/video/outdoor-event-vid-04.mp4', { headers: { ...headers, Range: 'bytes=999999999-' } })).status, 416);
  await request('/__review', { method: 'POST', headers: { ...headers, Origin: base, 'Content-Type': 'application/json' }, body: '{"enabled":false}' });
  assert.equal((await request(child, { headers })).status, 404);
  const enableAgain = await request('/__review', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"enabled":true}' });
  const again = { Cookie: enableAgain.headers.get('set-cookie').split(';')[0] };
  await request('/', { headers: again });
  assert.equal((await request(child, { headers: again })).status, 404);
});

test('production server cannot enable private review or expose the archive', async t => {
  const server = await createPreviewServer({ production: true, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base)).status, 200);
  for (const route of ['/media/vardhaman/hero/rushab-warm-hero-v1.png', '/media/vardhaman/video-posters/vid-03.jpg', '/__review']) {
    assert.equal((await fetch(base + route)).status, 404);
  }
  assert.equal((await fetch(base + '/__review', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{"enabled":true}' })).status, 405);
  assert.deepEqual(await (await fetch(base + '/catalogue.json')).json(), []);
});
