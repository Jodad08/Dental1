#!/usr/bin/env node
// Local preview: builds, serves dist/ and rebuilds when content or designs change.
//   node build/dev.mjs [--design sage] [--content clients/x] [--port 4321]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i === -1 ? fallback : args[i + 1];
};
const port = Number(flag('port', process.env.PORT || 4321));
const dist = path.join(root, 'dist');
const pass = args.filter((a, i) => a !== '--port' && args[i - 1] !== '--port');
const build = () => spawnSync(process.execPath, [path.join(root, 'build/build.mjs'), ...pass], { stdio: 'inherit' }).status === 0;

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const clients = new Set();
// Only the top page listens: previews inside the chooser's frames would use up the browser's connections.
const RELOAD = '<script>if(self===top)new EventSource("/__reload").onmessage=()=>location.reload()</script>';

build();
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (pathname === '/__reload') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write('\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    let file = path.join(dist, pathname);
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) return res.writeHead(301, { location: pathname + '/' }).end();
      file = path.join(file, 'index.html');
    }
    let status = 200;
    if (!fs.existsSync(file)) {
      status = 404;
      file = path.join(dist, '404.html');
    }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    let body = fs.readFileSync(file);
    if (type.startsWith('text/html')) body = Buffer.from(body.toString().replace('</body>', RELOAD + '</body>'));
    res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  })
  .listen(port, () => console.log(`\nPreview: http://localhost:${port}/  (rebuilds on save)`));

let timer;
for (const dir of ['content', 'designs', 'shared', 'build', flag('content', '')].filter(Boolean)) {
  const full = path.resolve(root, dir);
  if (!fs.existsSync(full)) continue;
  fs.watch(full, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (build()) for (const res of clients) res.write('data: reload\n\n');
    }, 120);
  });
}
