// Generates optimized delivery copies of approved media into media-optimized/.
// Originals under media/vardhaman/ are never modified. The build prefers a
// derivative when one exists. Re-run after adding or changing approved media:
//   node scripts/optimize-media.mjs
// Requires sharp (devDependency) and ffmpeg (local only; derivatives are committed).
import { mkdir, stat, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { root, readV2Manifest, readV2Outcomes } from './contracts.mjs';
import { planMedia } from '../src/v2-media.mjs';
import { planOutcomes } from '../src/v2-outcomes.mjs';

export const optimizedDir = path.join(root, 'media-optimized');
const size = async file => (await stat(file)).size;

const plan = planMedia(await readV2Manifest());
const outcomes = planOutcomes(await readV2Outcomes());
const manifest = await readV2Manifest();
const keepOriginal = new Set(manifest.assets.filter(a => a.derivation).map(a => a.production_path));

let before = 0, after = 0;
for (const asset of [...plan.copies, ...outcomes.copies]) {
  const src = path.join(root, asset.source_path);
  const dest = path.join(optimizedDir, asset.production_path);
  const original = await size(src);
  before += original;
  if (keepOriginal.has(asset.production_path)) { after += original; continue; }
  await mkdir(path.dirname(dest), { recursive: true });
  const tmp = dest + '.tmp' + path.extname(dest);
  const ext = path.extname(src).toLowerCase();
  if (ext === '.mp4') {
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', src,
      '-vf', "scale='min(854,iw)':-2,fps=30", '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '33',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', tmp], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('ffmpeg failed: ' + asset.id);
  } else if (ext === '.png') {
    await sharp(src).resize({ width: 1000, withoutEnlargement: true }).png({ palette: true, quality: 70, effort: 8 }).toFile(tmp);
  } else {
    await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 76, mozjpeg: true }).toFile(tmp);
  }
  if ((await size(tmp)) < original * 0.95) { await rename(tmp, dest); after += await size(dest); }
  else { await rm(tmp, { force: true }); await rm(dest, { force: true }); after += original; }
}
console.log(`Media: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
