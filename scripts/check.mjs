import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
async function checkDirectory(dir) {
  for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
    if (entry.isDirectory()) { await checkDirectory(`${dir}/${entry.name}`); continue; }
    if (!/\.(mjs|js)$/.test(entry.name)) continue;
    const result = spawnSync(process.execPath, ['--check', `${dir}/${entry.name}`], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
for (const dir of ['src', 'scripts', 'tests']) await checkDirectory(dir);
console.log('JavaScript syntax checks passed.');
