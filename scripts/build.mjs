import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderPage } from '../src/sections.mjs';
import { canPublish, selectMedia, toCard, mediaUrl } from '../src/media.mjs';
import { optimiseImages } from './images.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function readContracts() {
  const [content, manifest] = await Promise.all(['site-content', 'media-manifest'].map(name =>
    readFile(path.join(root, 'content', `${name}.json`), 'utf8').then(JSON.parse)));
  return { content, manifest };
}

export async function build({ localReview = false, output = path.join(root, localReview ? '.local-preview' : 'dist') } = {}) {
  // Only these generated directories may be cleared; the source media archive is never touched.
  if (![path.join(root, 'dist'), path.join(root, '.local-preview')].includes(output)) throw new Error('Invalid build directory');
  const { content, manifest } = await readContracts();
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const approved = selectMedia(manifest.assets);
  await Promise.all([
    writeFile(path.join(output, 'index.html'), renderPage(content, manifest.assets, { localReview })),
    writeFile(path.join(output, 'catalogue.json'), JSON.stringify(approved.filter(asset => asset.category !== 'hero').map(toCard))),
    cp(path.join(root, 'src', 'styles.css'), path.join(output, 'styles.css')),
    cp(path.join(root, 'src', 'app.js'), path.join(output, 'app.js')),
    writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  ]);
  // Do NOT copy the whole archive into public/. Thumbnails inherit their video's release gate.
  for (const asset of manifest.assets.filter(canPublish)) {
    for (const source of [asset.path, asset.poster_path].filter(Boolean)) {
      const relative = mediaUrl(source).slice(1);
      await mkdir(path.dirname(path.join(output, relative)), { recursive: true });
      await cp(path.join(root, relative), path.join(output, relative));
    }
  }
  await optimiseImages(selectMedia(manifest.assets, { privateReview: localReview }), root, output);
  return { output, approvedCount: approved.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await build();
  console.log(`Production build: ${result.output}\nApproved public media: ${result.approvedCount}. Private review is excluded.`);
}
