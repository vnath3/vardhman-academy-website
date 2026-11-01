import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, readContracts, root } from './build.mjs';
import { selectMedia, mediaUrl, canPublish, toCard, imageVariants } from '../src/media.mjs';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4' };
export async function createPreviewServer({ production = false, port = production ? 4173 : 5173 } = {}) {
  const { output } = await build({ localReview: !production });
  const { manifest } = await readContracts();
  const sessions = new Set();
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    const origin = `http://${req.headers.host}`;
    const address = server.address();
    const validHosts = [`127.0.0.1:${address.port}`, `localhost:${address.port}`];
    if (!validHosts.includes(req.headers.host)) { res.writeHead(403).end(); return; }
    if (req.headers.origin && req.headers.origin !== origin) { res.writeHead(403).end(); return; }
    const token = /(?:^|;\s*)review=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
    const privateReview = !production && sessions.has(token);
    try {
      const url = new URL(req.url, origin);
      if (url.pathname === '/__review' && !production && req.method === 'POST') {
        if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') { res.writeHead(403).end(); return; }
        let body = '';
        for await (const chunk of req) { body += chunk; if (body.length > 100) { res.writeHead(413).end(); return; } }
        const { enabled } = JSON.parse(body);
        if (typeof enabled !== 'boolean') { res.writeHead(400).end(); return; }
        if (token) sessions.delete(token);
        const nextToken = enabled ? randomBytes(24).toString('hex') : '';
        if (enabled) sessions.add(nextToken);
        res.setHeader('Set-Cookie', `review=${nextToken}; HttpOnly; SameSite=Strict; Path=/${enabled ? '' : '; Max-Age=0'}`);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ enabled }));
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      if (!production && ['/', '/index.html'].includes(url.pathname)) {
        // A fresh page always starts with the child-media review toggle OFF.
        if (token) sessions.delete(token);
        res.setHeader('Set-Cookie', 'review=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
      }
      if (!production && url.pathname === '/catalogue.json') {
        const catalogue = selectMedia(manifest.assets, { privateReview }).filter(asset => asset.category !== 'hero').map(toCard);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(catalogue));
        return;
      }
      let target;
      if (!production && url.pathname.startsWith('/media/')) {
        const asset = manifest.assets.find(asset => [asset.path, asset.poster_path].filter(Boolean).some(source =>
          mediaUrl(source) === url.pathname || imageVariants(source).some(variant => variant.url === url.pathname)));
        const permitted = asset && (canPublish(asset) || asset.id === 'HERO-A'
          || (privateReview && asset.publish_status !== 'reference_only'));
        if (!permitted) { res.writeHead(404).end(); return; }
        target = path.join(url.pathname.endsWith('.webp') ? output : root, url.pathname.slice(1));
      } else {
        const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1);
        target = path.resolve(output, relative);
        if (!target.startsWith(output + path.sep)) { res.writeHead(404).end(); return; }
      }
      const info = await stat(target);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      const range = req.headers.range;
      let start = 0, end = info.size - 1;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
        end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
        if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.writeHead(range ? 206 : 200, { 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') res.end();
      else createReadStream(target, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400).end();
    }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const production = process.argv.includes('--production');
  const portIndex = process.argv.indexOf('--port');
  const server = await createPreviewServer({ production, ...(portIndex !== -1 ? { port: Number(process.argv[portIndex + 1]) } : {}) });
  console.log(`Vardhaman Academy ${production ? 'production preview' : 'private local review'}: http://127.0.0.1:${server.address().port}`);
}
