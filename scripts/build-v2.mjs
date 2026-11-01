import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readContracts } from './contracts.mjs';
import { canPublish, mediaUrl } from '../src/media.mjs';
import { galleryMedia } from '../src/v2-media.mjs';

export const v2Output = path.join(root, '.local-preview-v2');
export const v2Source = path.join(root, 'src', 'v2');
export const v2MediaPaths = [
  'brand/legacy-brand-poster-img-01.jpeg',
  'hero/rushab-warm-hero-v1.png',
  'mentor/rushab-seminar-img-09.jpeg', 'mentor/rushab-seminar-img-12.jpeg',
  'gallery/cricket-img-14.jpeg', 'gallery/cricket-img-16.jpeg', 'gallery/academy-event-img-17.jpeg',
  'review/olympiad-medal-img-18.jpeg', 'review/certificate-img-19.jpeg',
  'video/tug-of-war-vid-02.mp4', 'video/tug-of-war-vid-03.mp4',
  'video/outdoor-event-vid-04.mp4', 'video/football-vid-05.mp4', 'video/cricket-vid-06.mp4',
  ...['02', '03', '04', '05', '06'].map(id => `video-posters/vid-${id}.jpg`)
];

// The browser receives only this build-time allowlist. Hiding cards is not the
// publication boundary: denied originals, posters and URLs never enter dist/.
export function planMedia(assets, { privateReview = false } = {}) {
  const byId = new Map();
  for (const asset of assets) {
    if (byId.has(asset.id)) throw new Error(`Duplicate media ID: ${asset.id}`);
    byId.set(asset.id, asset);
  }
  function url(source) {
    mediaUrl(source); // Validate before resolving any filesystem path or HTML URL.
    // A shared file cannot inherit approval from one asset while another denies it.
    if (!privateReview && assets.some(asset => !canPublish(asset)
        && [asset.path, asset.poster_path].includes(source))) return null;
    const relative = source.slice('assets/'.length);
    return `./media/${relative}`;
  }
  function permitted(id, type) {
    const asset = byId.get(id);
    return asset && asset.type === type && (privateReview || canPublish(asset)) ? asset : null;
  }
  const feature = id => {
    const asset = permitted(id, 'image');
    return asset ? url(asset.path) : null;
  };
  const gallery = galleryMedia.flatMap(item => {
    const asset = permitted(item.id, item.type === 'video' ? 'video' : 'image');
    if (!asset) return [];
    const src = url(asset.path);
    const poster = asset.poster_path ? url(asset.poster_path) : undefined;
    if (!src) return [];
    if (item.type === 'video' && !poster) throw new Error(`Video ${item.id} requires an approved poster in production or an available review poster.`);
    return [{ ...item, src, poster }];
  });
  const runtime = {
    privateReview, gallery, logo: feature('IMG-01'), hero: feature('HERO-A'), mentor: feature('IMG-12')
  };
  const urls = [runtime.logo, runtime.hero, runtime.mentor, ...gallery.flatMap(item => [item.src, item.poster])];
  return { runtime, files: [...new Set(urls.filter(Boolean).map(url => url.slice('./media/'.length)))] };
}

export async function buildV2({ privateReview = false } = {}) {
  if (privateReview && process.env.NODE_ENV === 'production') {
    throw new Error('Private V2 media cannot be built in production mode.');
  }
  const { manifest } = await readContracts();
  const plan = planMedia(manifest.assets, { privateReview });
  const output = privateReview ? v2Output : path.join(root, 'dist');
  // Both paths are fixed generated directories inside this checkout.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of ['index.html', 'base.css', 'v2.css', 'concept.js', 'v2.js', 'fonts.css', 'fonts']) {
    await cp(path.join(v2Source, file), path.join(output, file), { recursive: true });
  }
  await writeFile(path.join(output, 'media-data.js'),
    `window.VARDHAMAN_MEDIA = ${JSON.stringify(plan.runtime).replaceAll('<', '\\u003c')};\n`);
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  if (!privateReview) {
    for (const relative of plan.files) {
      const destination = path.join(output, 'media', relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(root, 'media', 'vardhaman', relative), destination);
    }
    // Also supports manual dist/ uploads; Netlify reads these headers itself.
    await cp(path.join(root, 'config', 'production-headers.txt'), path.join(output, '_headers'));
  }
  return { output, html: await readFile(path.join(output, 'index.html'), 'utf8'), mediaFiles: privateReview ? [] : plan.files };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildV2({ privateReview: process.argv.includes('--private-review') });
  console.log(`${process.argv.includes('--private-review') ? 'Private review' : 'Production'} V2 build: ${result.output}\nPublic media files: ${result.mediaFiles.length}`);
}
