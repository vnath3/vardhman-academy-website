import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { root, readContracts } from '../scripts/build.mjs';
import { buildV2, planMedia } from '../scripts/build-v2.mjs';
import { verifyProduction } from '../scripts/verify-production.mjs';
import { createProductionServer } from '../scripts/preview-production.mjs';

const run = promisify(execFile);
const { manifest } = await readContracts();

test('public allowlist excludes pending assets, includes approved originals/posters and rejects unsafe paths', () => {
  assert.deepEqual(planMedia(manifest.assets).files, []);
  const assets = structuredClone(manifest.assets);
  for (const id of ['HERO-A', 'IMG-14', 'VID-03']) assets.find(asset => asset.id === id).publish_status = 'approved_for_public';
  const plan = planMedia(assets);
  assert.equal(plan.runtime.privateReview, false);
  assert.equal(plan.runtime.logo, null);
  assert.equal(plan.runtime.mentor, null);
  assert.deepEqual(plan.runtime.gallery.map(item => item.id).sort(), ['IMG-14', 'VID-03']);
  assert.deepEqual(plan.files.sort(), ['gallery/cricket-img-14.jpeg', 'hero/rushab-warm-hero-v1.png', 'video-posters/vid-03.jpg', 'video/tug-of-war-vid-03.mp4']);
  assert.throws(() => planMedia([...assets, assets[0]]), /Duplicate media ID/);
  const bad = structuredClone(assets);
  bad.find(asset => asset.id === 'HERO-A').path = 'assets/../../private.png';
  assert.throws(() => planMedia(bad), /Invalid media path/);
  const deniedAlias = { ...assets.find(asset => asset.id === 'IMG-14'), id: 'DENIED', publish_status: 'pending' };
  assert.ok(!planMedia([...assets, deniedAlias]).files.includes('gallery/cricket-img-14.jpeg'));
  const deniedPoster = { id: 'POSTER', type: 'image', path: 'assets/video-posters/vid-03.jpg', publish_status: 'pending' };
  assert.throws(() => planMedia([...assets, deniedPoster]), /requires an approved poster/);
  delete assets.find(asset => asset.id === 'VID-03').poster_path;
  assert.throws(() => planMedia(assets), /requires an approved poster/);
});

test('production CLI packages approved fixtures, removes stale media after revocation and fails on missing approved files', async t => {
  // Isolated checkout with synthetic bytes: no real student's publication status is changed.
  const fixture = await mkdtemp(path.join(tmpdir(), 'vardhaman-production-fixture-'));
  t.after(async () => {
    assert.equal(path.dirname(fixture), path.resolve(tmpdir()));
    assert.ok(path.basename(fixture).startsWith('vardhaman-production-fixture-'));
    await rm(fixture, { recursive: true, force: true });
  });
  for (const dir of ['scripts', 'src', 'content', 'config']) await cp(path.join(root, dir), path.join(fixture, dir), { recursive: true });
  const assets = structuredClone(manifest.assets);
  const ids = ['HERO-A', 'IMG-14', 'VID-03'];
  for (const asset of assets.filter(asset => ids.includes(asset.id))) {
    asset.publish_status = 'approved_for_public';
    for (const source of [asset.path, asset.poster_path].filter(Boolean)) {
      const target = path.join(fixture, 'media', 'vardhaman', source.slice(7));
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, `Synthetic regression fixture for ${source}`);
    }
  }
  const manifestFile = path.join(fixture, 'content', 'media-manifest.json');
  const save = () => writeFile(manifestFile, JSON.stringify({ ...manifest, assets }));
  const build = () => run(process.execPath, ['scripts/build-v2.mjs'], { cwd: fixture, env: { ...process.env, NODE_ENV: 'production' } });
  const verify = () => run(process.execPath, ['scripts/verify-production.mjs'], { cwd: fixture });
  await save(); await build(); await verify();
  const approved = path.join(fixture, 'dist', 'media', 'gallery', 'cricket-img-14.jpeg');
  assert.match(await readFile(approved, 'utf8'), /Synthetic regression fixture/);
  for (const asset of assets) asset.publish_status = 'pending';
  await save(); await build(); await verify();
  await assert.rejects(access(approved), { code: 'ENOENT' });
  assets.find(asset => asset.id === 'IMG-19').publish_status = 'approved_for_public';
  await save();
  await assert.rejects(build(), /ENOENT/);
});

test('real production output is V2, is clean, verifies all assets and serves without archive access', async t => {
  await buildV2();
  await writeFile(path.join(root, 'dist', 'stale-private.jpeg'), 'synthetic stale file');
  await assert.rejects(verifyProduction());
  await buildV2();
  const result = await verifyProduction();
  assert.equal(result.mediaFileCount, 0);
  assert.equal(result.galleryCount, 0);
  const server = await createProductionServer({ port: 0 });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /\.\/v2.js/);
  assert.match(page.headers.get('content-security-policy'), /font-src 'self'/);
  for (const route of ['/content/media-manifest.json', '/.git/config', '/media/gallery/cricket-img-14.jpeg', '/media/video-posters/vid-03.jpg', '/media/hero/rushab-warm-hero-v1.png', '/media/vardhaman/gallery/cricket-img-14.jpeg', '/docs/handoff-v2/README.md', '/__review', '/v2', '/missing.js']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
  assert.equal((await fetch(base, { method: 'POST', body: 'test' })).status, 405);
  const font = '/fonts/QGYvz_MVcBeNP4NJtEtq.woff2';
  const response = await fetch(base + font, { headers: { Range: 'bytes=0-15' } });
  assert.equal(response.status, 206);
  assert.equal((await response.arrayBuffer()).byteLength, 16);
  assert.equal((await fetch(base + font)).headers.get('content-type'), 'font/woff2');
});
