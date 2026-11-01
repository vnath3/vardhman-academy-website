import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './contracts.mjs';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };

// Serve the existing artifact only. No build and no access to the source archive.
export async function createProductionServer({ port = 4173 } = {}) {
  const output = await realpath(path.join(root, 'dist'));
  await stat(path.join(output, 'index.html'));
  const headers = Object.fromEntries((await readFile(path.join(output, '_headers'), 'utf8'))
    .split('\n').filter(line => /^  [A-Za-z-]+: /.test(line)).map(line => {
      const colon = line.indexOf(':');
      return [line.slice(2, colon), line.slice(colon + 2)];
    }));
  const server = http.createServer(async (req, res) => {
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    try {
      const url = new URL(req.url, 'http://localhost');
      const relative = decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
      const candidate = path.resolve(output, relative);
      if (!candidate.startsWith(output + path.sep) || relative === '_headers') { res.writeHead(404).end(); return; }
      const target = await realpath(candidate);
      if (!target.startsWith(output + path.sep)) { res.writeHead(404).end(); return; }
      const info = await stat(target);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      let start = 0, end = info.size - 1;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return;
        }
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.writeHead(req.headers.range ? 206 : 200, { 'Content-Length': info.size ? end - start + 1 : 0 });
      if (req.method === 'HEAD' || !info.size) res.end();
      else createReadStream(target, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch (error) { res.writeHead(['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 400).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--port');
  const server = await createProductionServer({ port: index === -1 ? 4173 : Number(process.argv[index + 1]) });
  console.log(`V2 production artifact: http://127.0.0.1:${server.address().port}`);
}
