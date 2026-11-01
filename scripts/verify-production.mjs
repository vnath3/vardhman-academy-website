import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readV2Manifest, readV2Settings } from './contracts.mjs';
import { planMedia, v2Source } from './build-v2.mjs';
import { renderSiteHtml, siteRuntime, robotsFile, productionHeaders } from '../src/v2-settings.mjs';

export async function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), `Symlink is not a deployment asset: ${entry.name}`);
    const relative = prefix + entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative + '/'));
    else files.push(relative);
  }
  return files.sort();
}

export async function verifyProduction() {
  const output = path.join(root, 'dist');
  const manifest = await readV2Manifest();
  const settings = await readV2Settings();
  const { runtime, files: mediaFiles, copies } = planMedia(manifest);
  const sourceFiles = ['index.html', 'base.css', 'v2.css', 'concept.js', 'v2.js', 'enquiry.js', 'dialogs.js', 'analytics.js', 'fonts.css',
    ...(await listFiles(path.join(v2Source, 'fonts'))).map(file => 'fonts/' + file)];
  const expected = [...sourceFiles, 'media-data.js', 'site-settings.js', 'robots.txt', '_headers', ...mediaFiles.map(file => 'media/' + file)].sort();
  const actual = await listFiles(output);
  assert.deepEqual(actual, expected, 'Artifact must contain only V2 code, fonts and approved media; rebuild to remove stale files.');
  for (const file of sourceFiles) {
    const source = await readFile(path.join(v2Source, file));
    const expectedBytes = file === 'index.html' ? Buffer.from(renderSiteHtml(source.toString('utf8'), settings, { media: runtime })) : source;
    assert.deepEqual(await readFile(path.join(output, file)), expectedBytes, `Source mismatch: ${file}`);
  }
  assert.equal(await readFile(path.join(output, 'site-settings.js'), 'utf8'), `window.VARDHAMAN_SITE = ${JSON.stringify(siteRuntime(settings)).replaceAll('<', '\\u003c')};\n`);
  assert.equal(await readFile(path.join(output, 'robots.txt'), 'utf8'), robotsFile(settings));
  const data = await readFile(path.join(output, 'media-data.js'), 'utf8');
  assert.ok(data.startsWith('window.VARDHAMAN_MEDIA = ') && data.endsWith(';\n'));
  const generated = JSON.parse(data.slice('window.VARDHAMAN_MEDIA = '.length, -2));
  assert.deepEqual(generated, JSON.parse(JSON.stringify(runtime)), 'Browser media data must match the public allowlist.');
  assert.equal(generated.privateReview, false);
  for (const asset of copies) {
    assert.deepEqual(await readFile(path.join(output, asset.production_path)), await readFile(path.join(root, asset.source_path)), `Media mismatch: ${asset.id}`);
  }
  assert.equal(await readFile(path.join(output, '_headers'), 'utf8'), productionHeaders(await readFile(path.join(root, 'config', 'production-headers.txt'), 'utf8'), settings));
  const checkUrl = async (url, from) => {
    if (url.startsWith('#')) return;
    if (from === 'index.html' && url === settings.site_url) return;
    if (from === 'index.html' && url === 'https://www.googletagmanager.com/gtag/js?id=G-4F7P27EQSF') return;
    assert.doesNotMatch(url, /^(?:[a-z]+:|\/\/)/i, `Unexpected external dependency: ${url}`);
    const target = path.resolve(output, path.dirname(from), url.split(/[?#]/)[0]);
    assert.ok(target.startsWith(output + path.sep), `Asset escaped dist: ${url}`);
    assert.ok((await stat(target)).isFile(), `Missing asset: ${from} -> ${url}`);
  };
  const html = await readFile(path.join(output, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) await checkUrl(match[1], 'index.html');
  for (const file of ['base.css', 'v2.css', 'fonts.css']) {
    const css = await readFile(path.join(output, file), 'utf8');
    for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) await checkUrl(match[1], file);
  }
  for (const file of mediaFiles) await checkUrl('./media/' + file, 'index.html');
  const sizes = await Promise.all(actual.map(async file => (await stat(path.join(output, file))).size));
  return { fileCount: actual.length, mediaFileCount: mediaFiles.length, galleryCount: generated.gallery.length, bytes: sizes.reduce((a, b) => a + b, 0) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('V2 production verification passed:', await verifyProduction());
}
