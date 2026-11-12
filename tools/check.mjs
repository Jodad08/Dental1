#!/usr/bin/env node
// Looks at the built pages in a real browser: photographs them at desktop,
// tablet and phone width and measures the things that break when content
// changes (headlines running to three lines, sideways scroll, unreadable
// contrast, text against the screen edge, missing pictures, uneven margins).
//
//   npm run build && npm run check                 every page in dist/
//   npm run check -- sage mint                     only these designs
//
// Needs Playwright (npm i -D playwright, or a global install). Screenshots and
// report.json land in .check/.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, '.check');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const shotsOnly = process.argv.includes('--shots');

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('Nothing to check: run "npm run build" first.');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  let file = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(dist) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = fs
  .readdirSync(dist, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(dist, d.name, 'index.html')))
  .map((d) => d.name);
const targets = (pages.length ? pages : ['']).filter((p) => !only.length || only.includes(p));
const WIDTHS = [
  [1440, 900, 'desktop'],
  [768, 1024, 'tablet'],
  [390, 844, 'phone'],
];

// Runs in the page. Returns the measurements for one width.
function measure() {
  const W = innerWidth;
  const H = innerHeight;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .mnav, .pv');
  };
  const linesOf = (el) => {
    const size = parseFloat(getComputedStyle(el).fontSize);
    const tops = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      range.selectNodeContents(n);
      for (const rc of range.getClientRects()) {
        if (rc.width < 1 || rc.height < size * 0.35) continue;
        const mid = rc.top + rc.height / 2;
        if (!tops.some((t) => Math.abs(t - mid) < size * 0.55)) tops.push(mid);
      }
    }
    return Math.max(1, tops.length);
  };
  const rgb = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.backgroundImage !== 'none' || p.tagName === 'IMG') return null;
      const c = rgb(cs.backgroundColor);
      if (c && c.a > 0.95) return c;
      // Sitting on a picture: contrast cannot be worked out from colours alone.
      if (p.parentElement && [...p.parentElement.querySelectorAll(':scope > img, :scope > .frame, :scope > picture, :scope > video')].some((m) => m !== p && !m.contains(el) && getComputedStyle(m).position !== 'static')) return null;
      if (cs.position === 'absolute' || cs.position === 'fixed') return null;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { headlines: [], small: [], contrast: [], edge: [], gradients: [], shadows: [], hairlines: [], blur: 0 };
  const heads = [...document.querySelectorAll('h1,h2,h3,h4')].filter(vis);
  for (const h of heads) {
    const n = linesOf(h);
    if (n > 2) out.headlines.push(`${h.tagName.toLowerCase()} "${h.innerText.replace(/\s+/g, ' ').slice(0, 50)}" → ${n} lines at ${Math.round(parseFloat(getComputedStyle(h).fontSize))}px`);
  }
  const h1 = document.querySelectorAll('h1');
  out.h1 = h1.length;
  out.h1OnFirstScreen = h1[0] ? h1[0].getBoundingClientRect().top < H * 0.95 : false;
  out.h1Size = h1[0] ? Math.round(parseFloat(getComputedStyle(h1[0]).fontSize)) : 0;
  out.overflow = Math.max(0, document.documentElement.scrollWidth - W);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let bodyChars = 0;
  const sizes = new Map();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.replace(/\s+/g, ' ').trim();
    const el = n.parentElement;
    if (text.length < 2 || !el || seen.has(el) || !vis(el) || el.closest('script,style,svg,select')) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const r = el.getBoundingClientRect();
    if (size < 13) out.small.push(`"${text.slice(0, 30)}" ${size}px`);
    if (text.length > 60) {
      bodyChars += text.length;
      sizes.set(size, (sizes.get(size) || 0) + text.length);
    }
    const range = document.createRange();
    range.selectNodeContents(n);
    const tr = range.getBoundingClientRect();
    const gapL = tr.left;
    const gapR = W - tr.right;
    const min = W < 600 ? 12 : 16;
    if (tr.width > 0 && (gapL < min || gapR < min) && gapL > -2 && gapR > -2 && !el.closest('.fit')) out.edge.push(`"${text.slice(0, 30)}" ${Math.round(Math.min(gapL, gapR))}px from the edge`);
    const fg = rgb(cs.color);
    const bg = bgOf(el);
    if (fg && bg && fg.a > 0.9) {
      const a = lum(fg);
      const b = lum(bg);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const need = size >= 24 ? 3 : 4.5;
      if (ratio < need) out.contrast.push(`"${text.slice(0, 30)}" ${ratio.toFixed(1)}:1 (needs ${need})`);
    }
    void r;
  }
  out.bodySize = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el) || el.closest('[data-ui]')) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const label = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
    if (cs.backgroundImage.includes('gradient(') && r.width * r.height > W * H * 0.02) {
      const stops = [...cs.backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map((m) => m[1].split(/[,\s/]+/).filter(Boolean).map(Number));
      const scrim = stops.length && stops.every((c) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) <= 14) && stops.some((c) => c.length > 3 && c[3] < 1);
      if (!scrim) out.gradients.push(label);
    }
    const fixed = (() => { for (let p = el, i = 0; p && i < 4; p = p.parentElement, i++) if (['fixed', 'sticky'].includes(getComputedStyle(p).position)) return true; return false; })();
    if (cs.boxShadow !== 'none' && !fixed && r.width > 40) out.shadows.push(label);
    if (cs.backdropFilter && cs.backdropFilter !== 'none') out.blur++;
    if (!el.matches('input,textarea,select,table,tr,td,th') && !el.closest('table')) {
      const thin = (w, s, c) => parseFloat(w) > 0 && parseFloat(w) <= 1.5 && s !== 'none' && (rgb(c)?.a ?? 0) > 0.02;
      const t = thin(cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor);
      const b = thin(cs.borderBottomWidth, cs.borderBottomStyle, cs.borderBottomColor);
      if ((t || b) && r.width >= 240) out.hairlines.push(label);
      if (r.height > 0 && r.height <= 1.5 && r.width >= 160 && (rgb(cs.backgroundColor)?.a ?? 0) > 0.02) out.hairlines.push(label);
    }
  }
  const imgs = [...document.images].filter(vis);
  out.broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  out.pictures = imgs.filter((i) => { const r = i.getBoundingClientRect(); return i.naturalWidth > 0 && r.width >= 120 && r.height >= 90 && r.width * r.height >= 160 * 120; }).length;
  out.buttonOnFirstScreen = [...document.querySelectorAll('main .btn, header .btn')].some((b) => { const r = b.getBoundingClientRect(); return vis(b) && r.top < H && r.bottom > 0; });
  out.height = document.documentElement.scrollHeight;
  return out;
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const report = {};
let fails = 0;
for (const slug of targets) {
  const name = slug || 'site';
  report[name] = {};
  const findings = [];
  for (const [w, h, label] of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    let moved = 0;
    await page.addInitScript(() => {
      window.__moved = new Set();
      const note = (e) => window.__moved.add(e.target);
      addEventListener('animationstart', note, true);
      addEventListener('transitionrun', note, true);
    });
    await page.goto(`${origin}/${slug ? slug + '/' : ''}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: path.join(outDir, `${name}-${label}-fold.jpg`), quality: 80 });
    // Scroll the whole page the way a visitor does, so entrances fire and lazy pictures load.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.6)) {
      await page.evaluate((yy) => scrollTo(0, yy), y);
      await page.waitForTimeout(140);
    }
    await page.waitForTimeout(900);
    moved = await page.evaluate(() => window.__moved.size);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${name}-${label}.jpg`), quality: 72, fullPage: true });
    if (!shotsOnly) {
      const m = await page.evaluate(measure);
      m.moving = moved;
      report[name][label] = m;
      const add = (level, id, msg) => findings.push({ level, id, width: w, msg });
      if (m.overflow) add('FAIL', 'overflow', `scrolls sideways by ${m.overflow}px`);
      if (m.headlines.length) add('FAIL', 'headline-lines', m.headlines.slice(0, 4).join('; '));
      if (m.h1 !== 1) add('FAIL', 'title', `${m.h1} h1 elements`);
      else if (!m.h1OnFirstScreen) add('FAIL', 'title', 'the h1 is not on the first screen');
      if (m.broken.length) add('FAIL', 'broken-image', m.broken.join(', '));
      if (m.gradients.length) add('FAIL', 'gradient', [...new Set(m.gradients)].slice(0, 4).join(', '));
      if (m.shadows.length) add('FAIL', 'shadow', [...new Set(m.shadows)].slice(0, 4).join(', '));
      if (m.hairlines.length) add('FAIL', 'hairline', [...new Set(m.hairlines)].slice(0, 4).join(', '));
      if (m.blur) add('WARN', 'glass', `${m.blur} blurred surfaces`);
      if (m.small.length) add(m.small.length > 3 ? 'FAIL' : 'WARN', 'small-text', m.small.slice(0, 4).join('; '));
      if (m.bodySize && m.bodySize < 16) add(m.bodySize < 15 ? 'FAIL' : 'WARN', 'body-size', `running text is ${m.bodySize}px`);
      if (m.contrast.length) add('WARN', 'contrast', m.contrast.slice(0, 5).join('; '));
      if (m.edge.length) add('FAIL', 'edge-text', m.edge.slice(0, 4).join('; '));
      if (w >= 1100 && m.pictures < 4) add('FAIL', 'few-pictures', `${m.pictures} pictures`);
      if (!m.buttonOnFirstScreen) add('WARN', 'first-action', 'no button on the first screen');
      if (w >= 1100 && m.moving < 8) add('FAIL', 'still-page', `${m.moving} moving elements`);
    }
    await ctx.close();
  }
  const allow = [];
  const shown = findings.filter((f) => !allow.includes(f.id));
  fails += shown.filter((f) => f.level === 'FAIL').length;
  console.log(`\n${name}  ${shown.length ? '' : 'clean'}`);
  for (const f of shown) console.log(`  ${f.level} ${f.id} @${f.width}: ${f.msg}`);
}
await browser.close();
server.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
console.log(`\nScreenshots: ${path.relative(root, outDir)}/   ${fails ? fails + ' FAIL' : 'no FAIL'}`);
process.exit(fails ? 1 : 0);
