import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { mediaUrl, imageVariants } from '../src/media.mjs';

export async function optimiseImages(assets, root, output) {
  for (const asset of assets.filter(asset => asset.type === 'image')) {
    const original = path.join(root, mediaUrl(asset.path).slice(1));
    for (const { width, url } of imageVariants(asset.path)) {
      const target = path.join(output, url.slice(1));
      await mkdir(path.dirname(target), { recursive: true });
      await sharp(original).rotate().resize({ width }).webp({ quality: 82 }).toFile(target);
    }
  }
}
