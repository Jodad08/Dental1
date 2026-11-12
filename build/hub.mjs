// The chooser page of a preview build: every design, live, with this
// practice's own content, side by side.
import { html, plain } from './html.mjs';

export function renderHub({ designs, c, v }) {
  const name = c.practice.name;
  return String(html`<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${plain(name)} · website designs</title>
<link rel="stylesheet" href="assets/hub.css?v=${v}">
</head>
<body>
<header class="top">
  <h1>${designs.length} designs for ${name}</h1>
  <p>Each one is the full site with the same details and pictures. Open any of them, try it on a phone, and tell us the one you like.${c.demo ? ' The practice shown is a sample.' : ''}</p>
</header>
<main class="grid">
${designs.map(
  (d, i) => html`<article class="item">
  <a class="frame" href="${d.slug}/" aria-label="Open the ${d.name} design"><iframe src="${d.slug}/" title="${d.name} preview" loading="${i < 2 ? 'eager' : 'lazy'}" tabindex="-1" scrolling="no"></iframe></a>
  <div class="meta"><h2><a href="${d.slug}/">${d.name}</a></h2><p>${d.summary}</p></div>
</article>`,
)}
</main>
<script>
(() => {
  const frames = [...document.querySelectorAll('.frame')];
  const scale = () => frames.forEach((f) => f.style.setProperty('--s', f.clientWidth / 1440));
  scale();
  addEventListener('resize', scale);
})();
</script>
</body>
</html>
`);
}
