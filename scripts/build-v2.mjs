import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './build.mjs';

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

// V2 Milestone 1 is a private review, not a production artifact. V1's approved-only
// production builder remains intact. No student media is copied to dist/ here.
export async function buildV2({ privateReview = false } = {}) {
  if (!privateReview || process.env.NODE_ENV === 'production') {
    throw new Error('V2 is not cleared for production. Use the explicit local private-review workflow.');
  }
  await mkdir(v2Output, { recursive: true });
  await cp(v2Source, v2Output, { recursive: true });
  await writeFile(path.join(v2Output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  return { output: v2Output, html: await readFile(path.join(v2Output, 'index.html'), 'utf8') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildV2({ privateReview: process.argv.includes('--private-review') });
  console.log(`Private V2 review built in ${result.output}. Media is served from the retained archive only on loopback.`);
}
