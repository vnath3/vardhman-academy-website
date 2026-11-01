import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function readContracts() {
  const [content, manifest] = await Promise.all(['site-content', 'media-manifest'].map(name =>
    readFile(path.join(root, 'content', `${name}.json`), 'utf8').then(JSON.parse)));
  return { content, manifest };
}
