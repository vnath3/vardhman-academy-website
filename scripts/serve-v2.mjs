import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildV2, v2MediaPaths } from './build-v2.mjs';
import { root } from './build.mjs';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain', '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
export async function createV2Server({ port = 5173 } = {}) {
  const { output } = await buildV2({ privateReview: true });
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    // Reference uses inline presentation attributes; scripts and network destinations stay local.
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; media-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    if (![`127.0.0.1:${server.address().port}`, `localhost:${server.address().port}`].includes(req.headers.host)
        || req.headers['sec-fetch-site'] === 'cross-site'
        || (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`)) { res.writeHead(403).end(); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const relative = decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
      let target;
      if (relative.startsWith('media/')) {
        const mediaPath = relative.slice('media/'.length);
        if (!v2MediaPaths.includes(mediaPath)) { res.writeHead(404).end(); return; }
        target = path.join(root, 'media', 'vardhaman', mediaPath);
      } else {
        target = path.resolve(output, relative);
        if (!target.startsWith(output + path.sep)) { res.writeHead(404).end(); return; }
      }
      const info = await stat(target);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      let start = 0, end = info.size - 1;
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
        if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.writeHead(req.headers.range ? 206 : 200, { 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') res.end();
      else createReadStream(target, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch (error) { res.writeHead(['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 400).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--port');
  const server = await createV2Server({ port: index === -1 ? 5173 : Number(process.argv[index + 1]) });
  console.log(`Vardhaman Academy V2 · PRIVATE LOCAL REVIEW: http://127.0.0.1:${server.address().port}`);
}
