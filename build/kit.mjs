// What a design needs to render a page: markup helpers shared by every design.
// The look lives in each design's own template and stylesheet; this file only
// holds the parts that must behave the same everywhere (form, hours, menu…).
import { html, raw, rich, plain, esc, lines } from './html.mjs';
import { icon } from './icons.mjs';

export { html, raw, rich, plain, esc, lines, icon };

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/** Resolve a content path (images/hero.jpg) for the page being rendered. */
export const url = (ctx, p) => (!p ? '' : ABSOLUTE.test(p) ? p : ctx.base + p.replace(/^\.?\//, ''));

export const initials = (name) =>
  String(name || '')
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
    .split(/[\s,]+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/**
 * A picture slot. Renders the image when there is one; otherwise a quiet
 * filled block (with initials for people) so a missing photo never breaks
 * the layout.
 */
export function pic(ctx, im, { cls = '', alt = '', eager = false, name = '' } = {}) {
  if (!im || !im.src) {
    return html`<span class="ph ${cls}" role="img" aria-label="${alt || name || 'Photo'}">${name ? html`<span>${initials(name)}</span>` : ''}</span>`;
  }
  const style = im.position ? raw(` style="object-position:${esc(im.position)}"`) : '';
  const load = eager ? raw('fetchpriority="high" decoding="async"') : raw('loading="lazy" decoding="async"');
  return html`<img class="${cls}" src="${url(ctx, im.src)}" alt="${im.alt || alt}" ${load}${style}>`;
}

/** Headline with each authored line (\n) wrapped so it can rise on load. */
export function headline(text) {
  return lines(text).map((l, i) => html`<span class="ln"><span data-line style="--i:${i}">${rich(l)}</span></span>`);
}

export function navLinks(ctx) {
  const { c, L } = ctx;
  return [
    c.services.items.length && { href: '#services', label: L.nav.services },
    c.doctors.items.length && { href: '#doctors', label: L.nav.doctors },
    c.reviews.items.length && { href: '#reviews', label: L.nav.reviews },
    (c.patientInfo.topics.length || c.patientInfo.faq.length) && { href: '#patient-info', label: L.nav.patientInfo },
    { href: '#contact', label: L.nav.contact },
  ].filter(Boolean);
}

export const navList = (ctx, cls = 'nav') =>
  html`<nav class="${cls}" aria-label="Main">${navLinks(ctx).map((l) => html`<a href="${l.href}">${l.label}</a>`)}</nav>`;

/** The primary action. One name everywhere on the page. */
export function book(ctx, cls = 'btn', label) {
  const p = ctx.c.practice;
  const ext = p.bookingExternal ? raw(' target="_blank" rel="noopener"') : '';
  return html`<a class="${cls}" href="${p.bookingUrl}"${ext}>${label || ctx.L.book}</a>`;
}

export const callLink = (ctx, cls = 'link') => (ctx.c.practice.tel ? html`<a class="${cls}" href="${ctx.c.practice.tel}">${ctx.L.call} ${ctx.c.practice.phone}</a>` : '');

export const menuButton = (ctx) =>
  html`<button class="menu-btn" type="button" data-menu aria-controls="mnav" aria-expanded="false">${ctx.L.menu}</button>`;

function mobileNav(ctx) {
  const { c, L } = ctx;
  return html`<div class="mnav" id="mnav" hidden>
  <div class="mnav__top"><span class="mnav__name">${c.practice.name}</span><button class="mnav__close" type="button" data-menu-close>${L.close}</button></div>
  <nav class="mnav__links" aria-label="Menu">${navLinks(ctx).map((l) => html`<a href="${l.href}">${l.label}</a>`)}</nav>
  <div class="mnav__foot">${book(ctx)}${c.practice.tel ? html`<a class="mnav__tel" href="${c.practice.tel}">${c.practice.phone}</a>` : ''}</div>
</div>`;
}

export function hoursTable(ctx, cls = 'hours') {
  const { c, L } = ctx;
  if (!c.hours.any) return '';
  return html`<table class="${cls}"><caption class="sr-only">${L.hours}</caption><tbody>${c.hours.rows.map(
    (r) => html`<tr${r.closed ? raw(' class="is-closed"') : ''}><th scope="row">${r.days}</th><td>${r.time}</td></tr>`,
  )}</tbody></table>`;
}

/** "Open now · closes 6 pm", worked out in the visitor's browser from the real hours. */
export function openStatus(ctx, cls = 'open-status') {
  const { c } = ctx;
  if (!c.hours.any) return '';
  const first = c.hours.rows.find((r) => !r.closed);
  return html`<span class="${cls}" data-open-status="${c.hours.data}">${first ? `${first.days} ${first.time}` : ''}</span>`;
}

export function stars(ctx, cls = 'stars') {
  const r = ctx.c.reviews.rating;
  if (!r) return '';
  return html`<span class="${cls}" role="img" aria-label="${r} ${ctx.L.ratingOf}">${[0, 1, 2, 3, 4].map(() => icon('star'))}</span>`;
}

/** "4.9 out of 5 · 312 reviews on Google" as plain words. */
export function ratingLine(ctx) {
  const { reviews: r } = ctx.c;
  const L = ctx.L;
  if (!r.rating) return '';
  const tail = r.count ? ` \u00b7 ${r.count} ${L.reviewsOn} ${r.source || ''}`.trimEnd() : '';
  return `${r.rating} ${L.ratingOf}${tail}`;
}

export function faq(ctx, items = ctx.c.patientInfo.faq, { cls = 'faq', group = 'faq', open = 0 } = {}) {
  if (!items.length) return '';
  return html`<div class="${cls}">${items.map(
    (f, i) => html`<details class="faq__item" name="${group}"${i === open ? raw(' open') : ''}><summary><span>${f.q}</span></summary><div class="faq__a"><p>${rich(f.a)}</p></div></details>`,
  )}</div>`;
}

/** Points and links of one patient-info topic. */
export function topicBody(t) {
  return html`${t.text ? html`<p>${rich(t.text)}</p>` : ''}${t.points.length ? html`<ul class="points">${t.points.map((pt) => html`<li>${pt}</li>`)}</ul>` : ''}${
    t.links.length ? html`<p class="topic-links">${t.links.map((l) => html`<a class="link" href="${l.href}">${l.label}</a>`)}</p>` : ''
  }`;
}

/**
 * The appointment form. With contact.formAction set it posts there; without
 * one it opens the visitor's email app with their answers filled in, so the
 * form is never a dead end.
 */
export function contactForm(ctx, cls = 'form') {
  const { c, L } = ctx;
  const F = L.form;
  const action = c.contact.formAction || c.practice.mailto || '#';
  return html`<form class="${cls}" data-form action="${action}" method="post" data-mode="${c.contact.formAction ? 'post' : 'mail'}" data-subject="${F.subject} \u2013 ${c.practice.name}" data-sent="${F.sent}" data-failed="${F.failed}">
  <label><span>${F.name}</span><input name="name" autocomplete="name" required></label>
  <label><span>${F.phone}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required></label>
  <label><span>${F.email}</span><input name="email" type="email" autocomplete="email"></label>
  ${c.services.items.length ? html`<label><span>${F.service}</span><select name="service"><option value="">${F.any}</option>${c.services.items.map((s) => html`<option>${s.name}</option>`)}</select></label>` : ''}
  <label class="form__wide"><span>${F.message}</span><textarea name="message" rows="3"></textarea></label>
  <div class="form__end"><button class="btn" type="submit">${F.submit}</button><p class="form__note" data-form-note>${F.note}</p></div>
</form>`;
}

const SOCIAL_ICONS = { instagram: 'instagram', facebook: 'facebook', tiktok: 'tiktok', youtube: 'youtube', x: 'twitter', twitter: 'twitter', linkedin: 'linkedin', google: 'google', whatsapp: 'whatsapp' };
export function social(ctx, cls = 'social') {
  const items = ctx.c.practice.social;
  if (!items.length) return '';
  return html`<ul class="${cls}">${items.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${icon(SOCIAL_ICONS[s.name.toLowerCase()] || 'globe')}</a></li>`)}</ul>`;
}

export function mapEmbed(ctx, cls = 'map') {
  const p = ctx.c.practice;
  if (!p.mapEmbedUrl) return '';
  return html`<iframe class="${cls}" src="${p.mapEmbedUrl}" title="${ctx.L.address}: ${p.addressLine}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

/** The practice name set to fill its box exactly (measured by shared/site.js). */
export const fit = (text, cls = '') => html`<span class="fit ${cls}" data-fit>${text}</span>`;

/** Small print every footer carries. */
export function legal(ctx) {
  const { c, L } = ctx;
  return html`<p class="legal">\u00a9 <span data-year>${new Date().getFullYear()}</span> ${c.practice.name}. ${L.rights}${c.credits ? html` ${c.credits}` : ''}</p>`;
}

function jsonLd(ctx) {
  const { c } = ctx;
  const p = c.practice;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: p.name,
    description: c.seo.description || undefined,
    url: c.seo.url || undefined,
    telephone: p.phone || undefined,
    email: p.email || undefined,
    image: c.seo.url && c.img.hero ? `${c.seo.url}/${c.img.hero.src}` : undefined,
    address: p.addressLine ? { '@type': 'PostalAddress', streetAddress: p.address.street, addressLocality: p.address.city, addressRegion: p.address.region, postalCode: p.address.postal, addressCountry: p.address.country || undefined } : undefined,
    openingHoursSpecification: c.hours.schema.length ? c.hours.schema : undefined,
    sameAs: p.social.length ? p.social.map((s) => s.url) : undefined,
  };
  return raw(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
}

function previewBar(ctx) {
  const h = ctx.hub;
  if (!h) return '';
  return html`<aside class="pv" aria-label="Design preview">
  <a href="../">All designs</a>
  <a href="../${h.prev.slug}/" aria-label="Previous design: ${h.prev.name}">\u2190</a>
  <span>${h.index + 1}/${h.total} ${ctx.design.name}</span>
  <a href="../${h.next.slug}/" aria-label="Next design: ${h.next.name}">\u2192</a>
  ${ctx.c.demo ? html`<span class="pv__demo">Sample content</span>` : ''}
</aside>`;
}

/** Wrap a design's markup in the full document. */
export function page(ctx, body) {
  const { c, design } = ctx;
  const theme = Object.entries(c.theme).filter(([k]) => /^--[\w-]+$/.test(k));
  const index = c.seo.indexable && !ctx.hub;
  const ogImage = c.seo.url && c.img.hero ? `${c.seo.url}/${c.img.hero.src}` : '';
  return html`<!doctype html>
<html lang="${c.lang}" class="d-${design.slug}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${plain(c.seo.title)}</title>
<meta name="description" content="${plain(c.seo.description)}">
${index ? '' : raw('<meta name="robots" content="noindex, nofollow">')}
${index && c.seo.url ? html`<link rel="canonical" href="${c.seo.url}/">` : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${plain(c.seo.title)}">
<meta property="og:description" content="${plain(c.seo.description)}">
${ogImage ? html`<meta property="og:image" content="${ogImage}">` : ''}
<meta name="theme-color" content="${design.themeColor || '#ffffff'}">
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="${ctx.base}assets/fonts.css?v=${ctx.v}">
<link rel="stylesheet" href="${ctx.base}assets/base.css?v=${ctx.v}">
<link rel="stylesheet" href="${ctx.base}assets/designs/${design.slug}.css?v=${ctx.v}">
${theme.length ? raw(`<style>:root{${theme.map(([k, v]) => `${k}:${esc(v)}`).join(';')}}</style>`) : ''}
${jsonLd(ctx)}
</head>
<body>
<a class="skip" href="#main">${ctx.L.skip}</a>
${body}
${mobileNav(ctx)}
${previewBar(ctx)}
<script src="${ctx.base}assets/site.js?v=${ctx.v}" defer></script>
</body>
</html>
`;
}
