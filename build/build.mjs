#!/usr/bin/env node
// Builds the site into dist/.
//
//   node build/build.mjs                      build what content/site.jsonc asks for
//   node build/build.mjs --design sage        one design at the site root (a real site)
//   node build/build.mjs --design all         every design + a chooser page (a preview)
//   node build/build.mjs --content clients/x  use another content folder
//   node build/build.mjs --out somewhere      write somewhere other than dist/
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadContent, resolve, imageRefs } from './content.mjs';
import { fontCss, fontFiles } from './fonts.mjs';
import { page } from './kit.mjs';
import { plain } from './html.mjs';
import { renderHub } from './hub.mjs';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i === -1 ? fallback : args[i + 1];
};
const contentDir = path.resolve(root, flag('content', 'content'));
const outDir = path.resolve(root, flag('out', 'dist'));
const warnings = [];
const warn = (msg) => warnings.push(msg);

async function loadDesigns() {
  const dir = path.join(root, 'designs');
  const slugs = fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'design.mjs'))).sort();
  const designs = [];
  for (const slug of slugs) {
    const mod = await import(pathToFileURL(path.join(dir, slug, 'design.mjs')).href + `?t=${Date.now()}`);
    designs.push({ ...mod.default, slug, dir: path.join(dir, slug) });
  }
  return designs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};
const copyDir = (from, to, skip = () => false) => {
  if (!fs.existsSync(from)) return;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || skip(entry.name)) continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else {
      fs.mkdirSync(to, { recursive: true });
      fs.copyFileSync(a, b);
    }
  }
};

// Headlines hold two lines at every width only if they are short enough.
function checkCopy(c, slug) {
  const heads = { 'hero.title': c.hero.title, 'services.title': c.services.title, 'doctors.title': c.doctors.title, 'reviews.title': c.reviews.title, 'patientInfo.title': c.patientInfo.title, 'contact.title': c.contact.title, 'about.title': c.about.title, 'cta.title': c.cta.title };
  for (const [key, text] of Object.entries(heads)) {
    const n = plain(text).length;
    if (n > 44) warn(`[${slug}] ${key} is ${n} characters ("${plain(text).slice(0, 40)}…"). Headlines hold two lines up to about 40; move the rest into the text under it.`);
  }
}

const site = loadContent(contentDir);
const designs = await loadDesigns();
if (!designs.length) throw new Error('No designs found in designs/');
const wanted = flag('design', site.design || 'all');
const hubMode = wanted === 'all';
const chosen = hubMode ? designs : designs.filter((d) => d.slug === wanted);
if (!chosen.length) throw new Error(`Unknown design "${wanted}". Available: ${designs.map((d) => d.slug).join(', ')}, or "all".`);

fs.rmSync(outDir, { recursive: true, force: true });
const v = Date.now().toString(36);

// The client's pictures and files (everything in the content folder except the data file).
copyDir(contentDir, outDir, (name) => /^site\.jsonc?$|\.md$/i.test(name));

// Shared assets and only the fonts the chosen designs use.
const assets = path.join(outDir, 'assets');
for (const f of ['base.css', 'site.js']) write(path.join(assets, f), fs.readFileSync(path.join(root, 'shared', f)));
const fontKeys = [...new Set(chosen.flatMap((d) => d.fonts || []))];
write(path.join(assets, 'fonts.css'), fontCss(fontKeys));
for (const file of fontFiles(fontKeys)) {
  fs.mkdirSync(path.join(assets, 'fonts'), { recursive: true });
  fs.copyFileSync(path.join(root, 'shared/fonts', file), path.join(assets, 'fonts', file));
}

const missing = new Set();
let demo = false;
let indexable = false;
let siteUrl = '';
chosen.forEach((design, i) => {
  const c = resolve(site, design);
  demo = c.demo;
  indexable = c.seo.indexable && !hubMode;
  siteUrl = c.seo.url;
  for (const im of imageRefs(c)) {
    if (/^(https?:|\/\/|data:)/.test(im.src)) continue;
    if (!fs.existsSync(path.join(contentDir, im.src))) {
      missing.add(im.src);
      im.src = '';
    }
  }
  checkCopy(c, design.slug);
  const ctx = {
    c,
    L: c.L,
    design,
    v,
    base: hubMode ? '../' : '',
    hub: hubMode ? { index: i, total: chosen.length, prev: chosen[(i - 1 + chosen.length) % chosen.length], next: chosen[(i + 1) % chosen.length] } : null,
  };
  const out = String(page(ctx, design.render(ctx)));
  write(path.join(outDir, hubMode ? design.slug : '', 'index.html'), out);
  write(path.join(assets, 'designs', `${design.slug}.css`), fs.readFileSync(path.join(design.dir, 'styles.css')));
  copyDir(path.join(design.dir, 'assets'), path.join(assets, 'designs', design.slug));
});
for (const src of missing) warn(`Picture not found: content/${src} (a plain block is shown in its place).`);

const first = resolve(site, chosen[0]);
if (hubMode) {
  write(path.join(assets, 'hub.css'), fs.readFileSync(path.join(root, 'shared/hub.css')));
  write(path.join(outDir, 'index.html'), renderHub({ designs: chosen, c: first, v }));
}
write(
  path.join(outDir, '404.html'),
  `<!doctype html><html lang="${first.lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · ${plain(first.practice.name)}</title><style>body{margin:0;min-height:100svh;display:grid;place-content:center;gap:1rem;padding:1.5rem;font:1.125rem/1.5 system-ui,sans-serif;background:#f4f4f1;color:#111}h1{margin:0;font-size:clamp(2.5rem,8vw,5rem);line-height:1;letter-spacing:-.03em;font-weight:500}a{color:inherit}</style><h1>Page not found</h1><p>That page does not exist. <a href="/">Back to ${plain(first.practice.name)}</a></p></html>\n`,
);
write(path.join(outDir, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}` : 'User-agent: *\nDisallow: /\n');
if (indexable && siteUrl) write(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n`);
write(
  path.join(outDir, '_headers'),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n${indexable ? '' : '  X-Robots-Tag: noindex\n'}\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);

if (demo) warn('content/site.jsonc still has "demo": true. The practice, reviews, figures and photographs are samples; replace them before a client or the public sees this.');
if (!indexable && !hubMode) warn('Search engines are told not to index this build. Set seo.indexable to true (and seo.url) when the site goes live.');
console.log(`Built ${hubMode ? `${chosen.length} designs + chooser` : `"${chosen[0].slug}"`} for ${first.practice.name} → ${path.relative(root, outDir)}/`);
for (const w of warnings) console.log(`  ! ${w}`);
