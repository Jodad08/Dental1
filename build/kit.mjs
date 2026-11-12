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

// ---------------------------------------------------------------- blocks
// Plain, unstyled pieces several designs share. Each design arranges and
// styles them its own way; none of them carries a look.

const brk = (arr) => arr.map((l, i) => html`${i ? html`<br>` : ''}${l}`);

/** h2 + supporting sentence for a section (c.services, c.doctors, …). */
export const secHead = (s, cls = 'head') =>
  html`<div class="${cls}" data-stagger><h2 data-reveal>${rich(s.title)}</h2>${s.text ? html`<p data-reveal>${rich(s.text)}</p>` : ''}</div>`;

export const doctorList = (ctx, cls = 'docs') =>
  html`<ul class="${cls}" data-stagger>${ctx.c.doctors.items.map(
    (d) => html`<li data-reveal><div class="docs__pic frame">${pic(ctx, d.photo, { name: d.name, alt: d.name })}</div><div class="docs__txt"><h3>${d.name}</h3><p class="docs__role">${d.role}</p><p class="docs__bio">${d.bio}</p></div></li>`,
  )}</ul>`;

export const quote = (ctx, r, cls = 'quote', face = true) =>
  html`<figure class="${cls}"><blockquote><p>“${r.quote}”</p></blockquote><figcaption>${face ? pic(ctx, r.photo, { cls: 'quote__face', name: r.name }) : ''}<span><strong>${r.name}</strong><br>${r.detail}</span></figcaption></figure>`;

export const quoteList = (ctx, items, cls = 'quotes') =>
  html`<ul class="${cls}" data-stagger>${items.map((r) => html`<li data-reveal><blockquote><p>“${r.quote}”</p></blockquote><p class="quotes__by"><strong>${r.name}</strong>, ${r.detail}</p></li>`)}</ul>`;

export function ratingBlock(ctx, cls = 'rating') {
  const r = ctx.c.reviews;
  if (!r.rating) return '';
  return html`<p class="${cls}">${stars(ctx)} ${ratingLine(ctx)}${r.url ? html` <a class="link" href="${r.url}" target="_blank" rel="noopener">${ctx.L.allReviews}</a>` : ''}</p>`;
}

/** Patient-info topics: pick a topic, read it. Works as plain stacked text without script. */
export function topicTabs(ctx, cls = 'topics') {
  const t = ctx.c.patientInfo.topics;
  if (!t.length) return '';
  return html`<div class="${cls}" data-pick>
  <div class="topics__tabs" role="tablist" aria-label="${ctx.c.patientInfo.title}">${t.map((x, i) => html`<button type="button" role="tab" aria-selected="${i === 0}" data-pick-item="${i}" class="${i === 0 ? 'is-on' : ''}">${x.title}</button>`)}</div>
  ${t.map((x, i) => html`<div class="topics__pane${i === 0 ? ' is-on' : ''}" role="tabpanel" data-pick-show="${i}" data-pick-hide><h3>${x.title}</h3>${topicBody(x)}</div>`)}
</div>`;
}

/** Every topic open, as rows (for designs that list instead of tab). */
export const topicRows = (ctx, cls = 'trows') =>
  html`<dl class="${cls}" data-stagger>${ctx.c.patientInfo.topics.map((x) => html`<div data-reveal><dt>${x.title}</dt><dd>${topicBody(x)}</dd></div>`)}</dl>`;

export function contactFacts(ctx, cls = 'facts') {
  const p = ctx.c.practice;
  return html`<div class="${cls}">
  <address>
    ${p.tel ? html`<a class="facts__tel" href="${p.tel}">${p.phone}</a>` : ''}
    ${p.mailto ? html`<a class="link" href="${p.mailto}">${p.email}</a>` : ''}
    ${p.addressLine ? html`<a class="link" href="${p.mapUrl}" target="_blank" rel="noopener">${brk(p.addressLines)}</a>` : ''}
    ${p.wa ? html`<a class="link" href="${p.wa}" target="_blank" rel="noopener">${ctx.L.whatsapp}</a>` : ''}
  </address>
  ${ctx.c.hours.any ? html`<div class="facts__hours"><p><strong>${openStatus(ctx)}</strong></p>${hoursTable(ctx)}</div>` : ''}
</div>`;
}

/** Address, phone, links, social and the legal line for a footer. */
export function footFacts(ctx, cls = 'ffacts') {
  const p = ctx.c.practice;
  return html`<div class="${cls}">
  <p><strong>${p.name}</strong>${p.addressLines.length ? html`<br>${brk(p.addressLines)}` : ''}</p>
  <p>${p.tel ? html`<a href="${p.tel}">${p.phone}</a><br>` : ''}${p.mailto ? html`<a href="${p.mailto}">${p.email}</a>` : ''}</p>
  ${navList(ctx, 'ffacts__nav')}
  ${social(ctx)}
</div>`;
}

/** The urgent-care line with a call button, or the booking prompt when there is none. */
export function ctaActs(ctx) {
  const p = ctx.c.practice;
  return html`<div class="acts">${p.tel ? html`<a class="btn" href="${p.tel}">${ctx.L.call} ${p.phone}</a>${book(ctx, 'link')}` : book(ctx)}</div>`;
}
export const ctaText = (ctx) => ctx.c.practice.emergency || ctx.c.cta.text || ctx.c.hero.text;

/**
 * Services as a list whose rows show their own picture and description:
 * point at, tab to or tap a row. Without script every description shows.
 */
export function servicePick(ctx, cls = 'svc') {
  const items = ctx.c.services.items;
  return html`<div class="${cls}" data-pick="hover">
  <ul class="svc__list">${items.map(
    (s, i) => html`<li><button type="button" class="svc__row${i === 0 ? ' is-on' : ''}" data-pick-item="${i}" aria-pressed="${i === 0}"><span class="svc__name">${s.name}</span>${s.price ? html`<span class="svc__price">${s.price}</span>` : ''}<span class="svc__text">${s.text}</span></button></li>`,
  )}</ul>
  <div class="svc__pics frame">${items.map((s, i) => html`<div class="svc__pic${i === 0 ? ' is-on' : ''}" data-pick-show="${i}">${pic(ctx, s.image || ctx.c.img.care, { alt: s.name })}</div>`)}</div>
</div>`;
}

/** Services as plain items: picture, name, text, price. */
export const serviceList = (ctx, cls = 'sv', { pics = true, items = ctx.c.services.items } = {}) =>
  html`<ul class="${cls}" data-stagger>${items.map(
    (s) => html`<li data-reveal${s.category ? raw(` data-cat="${esc(s.category)}"`) : ''}>${pics ? html`<div class="sv__pic frame">${pic(ctx, s.image, { alt: s.name })}</div>` : ''}<h3>${s.name}</h3><p>${s.text}</p>${s.price ? html`<p class="sv__price">${s.price}</p>` : ''}</li>`,
  )}</ul>`;

export const statList = (ctx, cls = 'figs') =>
  ctx.c.stats.length ? html`<dl class="${cls}" data-stagger>${ctx.c.stats.map((s) => html`<div data-reveal><dt>${s.value}</dt><dd>${s.label}</dd></div>`)}</dl>` : '';
