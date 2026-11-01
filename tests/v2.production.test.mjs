import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { root, readV2Manifest } from '../scripts/contracts.mjs';
import { buildV2, planMedia } from '../scripts/build-v2.mjs';
import { validateV2Manifest } from '../src/v2-media.mjs';
import { verifyProduction } from '../scripts/verify-production.mjs';
import { createProductionServer } from '../scripts/preview-production.mjs';

const run = promisify(execFile);
const manifest = await readV2Manifest();
const clone = () => structuredClone(manifest);
const approve = asset => {
  asset.approval_status = 'approved';
  asset.verified = Object.fromEntries(asset.required_verifications.map(key => [key, true]));
  asset.approval_record = { approved_by: 'Synthetic test only', approved_on: '2026-11-01', evidence: 'Isolated fixture; no real media approval is granted.' };
};

test('manifest inventories every supplied original and preserves the authentic logo pixels without the flyer', async () => {
  validateV2Manifest(manifest);
  assert.equal(manifest.assets.filter(asset => !asset.derivation).length, 20);
  for (const asset of manifest.assets) {
    await access(path.join(root, asset.source_path));
    if (!asset.derivation) {
      const reference = path.join(root, '.review-baselines/v2-handoff/reference_site', asset.production_path);
      // The original ZIP is local evidence, not a required CI checkout dependency.
      try { await access(reference); } catch { continue; }
      assert.deepEqual(await readFile(path.join(root, asset.source_path)), await readFile(reference), asset.id);
    }
  }
  const logo = manifest.assets.find(asset => asset.id === 'LOGO-V2');
  const parent = manifest.assets.find(asset => asset.id === logo.derivation.parent_id);
  const crop = await sharp(path.join(root, parent.source_path)).extract(logo.derivation.rectangle).raw().toBuffer();
  assert.deepEqual(await sharp(path.join(root, logo.source_path)).raw().toBuffer(), crop);
  assert.ok(!planMedia(manifest).files.includes('brand/legacy-brand-poster-img-01.jpeg'));
});

test('invalid states, missing rights/guardian evidence, duplicate paths and traversal fail closed', () => {
  for (const status of ['approved_for_public', true, '', undefined]) {
    const changed = clone(); changed.assets[0].approval_status = status;
    assert.throws(() => validateV2Manifest(changed), /Invalid approval status/);
  }
  const changed = clone();
  const student = changed.assets.find(asset => asset.id === 'IMG-14');
  student.approval_status = 'approved';
  assert.throws(() => planMedia(changed), /Unverified/);
  approve(student); student.verified.guardian_consent = false;
  assert.throws(() => planMedia(changed), /Unverified guardian_consent/);
  student.verified.guardian_consent = true; student.approval_record = null;
  assert.throws(() => planMedia(changed), /Missing approval/);
  for (const field of ['source_path', 'production_path']) {
    const bad = clone(); bad.assets[0][field] = 'media/../../private.jpeg';
    assert.throws(() => planMedia(bad), /Invalid .* path/);
  }
  const duplicate = clone(); duplicate.assets.push(duplicate.assets[0]);
  assert.throws(() => planMedia(duplicate), /Duplicate media ID/);
  const alias = clone(); alias.assets[1].source_path = alias.assets[0].source_path;
  assert.throws(() => planMedia(alias), /Duplicate source path/);
});

test('only individually approved assets enter production; videos and posters need both approvals', () => {
  const plan = planMedia(manifest);
  assert.ok(plan.copies.every(copy => manifest.assets.find(asset => asset.id === copy.id).approval_status === 'approved'));
  assert.ok(plan.runtime.logo && plan.runtime.hero && plan.runtime.mentor);
  const changed = clone(), video = changed.assets.find(asset => asset.id === 'VID-03');
  for (const asset of changed.assets.filter(asset => ['gallery', 'poster'].includes(asset.section))) asset.approval_status = 'pending';
  const poster = changed.assets.find(asset => asset.id === video.poster_id);
  approve(video);
  assert.equal(planMedia(changed).runtime.gallery.length, 0);
  approve(poster);
  assert.deepEqual(planMedia(changed).runtime.gallery.map(item => item.id), ['VID-03']);
  video.approval_status = 'pending';
  assert.ok(!planMedia(changed).copies.some(asset => asset.id === poster.id));
  const privatePlan = planMedia(manifest, { privateReview: true });
  assert.equal(privatePlan.runtime.gallery.length, manifest.assets.filter(asset => asset.section === 'gallery').length);
  assert.equal(privatePlan.copies.length, manifest.assets.length);
});

test('new gallery IDs and distinct source/output paths require only manifest updates', () => {
  const changed = clone();
  const added = { ...structuredClone(changed.assets.find(asset => asset.id === 'IMG-14')), id: 'NEW-PHOTO', source_path: 'media/vardhaman/gallery/new-supply.jpeg', production_path: 'media/gallery/approved-new-photo.jpeg', gallery_order: 100 };
  approve(added); changed.assets.push(added);
  const plan = planMedia(changed);
  assert.equal(plan.runtime.gallery.find(item => item.id === 'NEW-PHOTO').src, './media/gallery/approved-new-photo.jpeg');
  assert.equal(plan.copies.find(asset => asset.id === added.id).source_path, added.source_path);
});

test('isolated production CLI copies approvals, removes revoked files, verifies new entries and fails on missing sources', async t => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'vardhaman-production-fixture-'));
  t.after(async () => {
    assert.equal(path.dirname(fixture), path.resolve(tmpdir()));
    assert.ok(path.basename(fixture).startsWith('vardhaman-production-fixture-'));
    await rm(fixture, { recursive: true, force: true });
  });
  for (const dir of ['scripts', 'src', 'content', 'config']) await cp(path.join(root, dir), path.join(fixture, dir), { recursive: true });
  await mkdir(path.join(fixture, 'media/vardhaman'), { recursive: true });
  const changed = clone();
  for (const id of ['IMG-14', 'VID-03', 'VID-03-POSTER']) approve(changed.assets.find(asset => asset.id === id));
  const added = { ...structuredClone(changed.assets.find(asset => asset.id === 'IMG-14')), id: 'NEW-PHOTO', source_path: 'media/vardhaman/gallery/new-supply.jpeg', production_path: 'media/gallery/approved-new-photo.jpeg' };
  changed.assets.push(added);
  for (const asset of planMedia(changed).copies) {
    const target = path.join(fixture, asset.source_path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, `Synthetic regression fixture for ${asset.id}`);
  }
  const manifestFile = path.join(fixture, 'content', 'v2-media-manifest.json');
  const save = () => writeFile(manifestFile, JSON.stringify(changed));
  const build = () => run(process.execPath, ['scripts/build-v2.mjs'], { cwd: fixture, env: { ...process.env, NODE_ENV: 'production' } });
  const verify = () => run(process.execPath, ['scripts/verify-production.mjs'], { cwd: fixture });
  await save(); await build(); await verify();
  const approved = path.join(fixture, 'dist/media/gallery/approved-new-photo.jpeg');
  assert.match(await readFile(approved, 'utf8'), /Synthetic regression fixture/);
  for (const asset of changed.assets) asset.approval_status = 'pending';
  await save(); await build(); await verify();
  await assert.rejects(access(approved), { code: 'ENOENT' });
  approve(changed.assets.find(asset => asset.id === 'IMG-19'));
  await save();
  await assert.rejects(build(), /ENOENT/);
});

test('production artifact includes all approved bytes, excludes all other files and serves correct paths and MIME types', async t => {
  await buildV2();
  await writeFile(path.join(root, 'dist/stale-private.jpeg'), 'synthetic stale file');
  await assert.rejects(verifyProduction());
  await buildV2();
  const result = await verifyProduction();
  const expected = planMedia(manifest);
  assert.equal(result.mediaFileCount, expected.files.length);
  assert.equal(result.galleryCount, expected.runtime.gallery.length);
  const server = await createProductionServer({ port: 0 });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /\.\/v2.js/);
  for (const asset of manifest.assets) {
    const response = await fetch(base + '/' + asset.production_path);
    assert.equal(response.status, expected.copies.some(copy => copy.id === asset.id) ? 200 : 404, asset.id);
    if (response.ok) {
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(path.join(root, asset.source_path)));
      assert.equal(response.headers.get('content-type'), asset.production_path.endsWith('.png') ? 'image/png' : 'image/jpeg');
    }
  }
  for (const route of ['/media-review.html', '/content/v2-media-manifest.json', '/content/media-manifest.json', '/.git/config', '/media/vardhaman/gallery/cricket-img-14.jpeg', '/docs/handoff-v2/README.md', '/__review', '/v2', '/missing.js']) assert.equal((await fetch(base + route)).status, 404, route);
  assert.equal((await fetch(base, { method: 'POST', body: 'test' })).status, 405);
  const response = await fetch(base + '/fonts/QGYvz_MVcBeNP4NJtEtq.woff2', { headers: { Range: 'bytes=0-15' } });
  assert.equal(response.status, 206);
  assert.equal((await response.arrayBuffer()).byteLength, 16);
});
