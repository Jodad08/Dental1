// Evergreen: a serif headline with an italic second line, a deep green disc
// holding a drawn row of braces, and treatments you can filter by kind.
import { patientInfo, contactSection, html, raw, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText } from '../../build/kit.mjs';

// Seven teeth on an arc, each with its bracket, joined by one wire. Drawn flat in the palette.
function braces() {
  const teeth = [];
  const wire = [];
  for (let i = 0; i < 7; i++) {
    const t = (i - 3) / 3; // -1 … 1
    const x = 200 + t * 138;
    const y = 168 + t * t * 44;
    const rot = t * 24;
    const w = i === 3 ? 44 : 40 - Math.abs(t) * 6;
    const h = 56 - Math.abs(t) * 8;
    teeth.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"><rect x="${(-w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="13" fill="#fbfaf6"/><rect x="${(-w / 2).toFixed(1)}" y="${(h / 2 - 16).toFixed(1)}" width="${w.toFixed(1)}" height="16" rx="8" fill="#e3e6dd"/><rect x="-9" y="-9" width="18" height="18" rx="3" fill="#143a35"/></g>`);
    wire.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `<svg class="braces" viewBox="0 0 400 400" role="img" aria-label="A row of teeth with braces">
<circle cx="200" cy="200" r="200" fill="#1f7a6c"/>
<path d="M36 190C80 120 320 120 364 190C330 250 70 250 36 190Z" fill="#2c9484"/>
<path d="${wire.join('')}" fill="none" stroke="#ff6a55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
${teeth.join('')}
<path d="${wire.join('')}" fill="none" stroke="#ff6a55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 44" />
<path d="M118 296C160 328 240 328 282 296" fill="none" stroke="#17403a" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}

const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default {
  name: 'Evergreen',
  order: 5,
  summary: 'Friendly and plain-spoken. A serif headline, a green disc with drawn braces and treatments you can filter.',
  fonts: ['newsreader', 'dm-sans'],
  themeColor: '#17403a',
  // The reference sets one line of each headline in italic; kept as its signature.
  allow: ['mixed-font-headline', 'card-rows'],
  defaults: {
    hero: { title: 'Healthier smiles.\n*Gentle, honest care.*' },
    about: { title: 'How we work' },
    services: { title: 'Our *services*' },
    doctors: { title: 'Meet *our doctors*' },
    reviews: { title: 'Patient *reviews*' },
    patientInfo: { title: 'Patient *info*' },
    cta: { title: 'In pain *right now?*' },
    contact: { title: 'Get *in touch*' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    const cats = c.services.categories;
    return html`
<div class="bar">
  <div class="wrap bar__in">
    <p>${p.tel ? html`<a href="${p.tel}">${L.call} ${p.phone}</a>` : ''}${p.addressLine ? html`<span class="bar__addr">${p.addressLine}</span>` : ''}</p>
    <p>${openStatus(ctx)}</p>
  </div>
</div>
<header class="top wrap">
  <a class="brand" href="#main"><span>${p.name}</span><small>${p.kind}</small></a>
  ${navList(ctx)}
  ${book(ctx, 'btn top__book')}
  ${menuButton(ctx)}
</header>

<main id="main">
<section class="hero wrap g12">
  <div class="hero__copy">
    <h1>${headline(c.hero.title)}</h1>
    <p class="lead" data-load style="--d:380ms">${rich(c.hero.text)}</p>
    <div class="acts" data-load style="--d:460ms">${book(ctx)}${p.wa ? html`<a class="btn btn--green" href="${p.wa}" target="_blank" rel="noopener">${L.whatsapp}</a>` : callLink(ctx)}</div>
  </div>
  <div class="hero__art" data-load style="--d:200ms">
    <div class="disc frame" data-drift>${pic(ctx, c.img.portrait, { eager: true })}</div>
    <p class="note note--2"><strong>${openStatus(ctx)}</strong></p>
  </div>
</section>

${c.about.points.length ? html`<section class="quick wrap" id="about">
  <h2 class="sr-only">${rich(c.about.title)}</h2>
  <dl class="quick__panel" data-stagger>${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
</section>` : ''}

<section class="sec services wrap" id="services" data-pick>
  <div class="services__head g12">
    ${secHead(c.services, 'services__title')}
    ${cats.length > 1 ? html`<div class="filter" role="group" aria-label="${L.nav.services}"><button type="button" class="is-on" aria-pressed="true" data-pick-item="all">All</button>${cats.map((k) => html`<button type="button" aria-pressed="false" data-pick-item="${key(k)}">${k}</button>`)}</div>` : ''}
  </div>
  <ul class="cards">${c.services.items.map(
    (s, i) => html`<li class="card${i === 0 ? ' card--lead' : ''}${i === 0 && c.services.items.length % 4 === 3 ? ' card--wide' : ''} is-on" data-pick-show="all ${key(s.category)}" data-pick-hide>
      <h3>${s.name}</h3>
      <p>${s.text}</p>
      ${s.price ? html`<p class="card__fee">${s.price}</p>` : ''}
    </li>`,
  )}</ul>
</section>

<section class="sec doctors" id="doctors">
  <div class="wrap">
    ${secHead(c.doctors, 'head g12')}
    ${doctorList(ctx)}
  </div>
</section>

${lead ? html`<section class="sec reviews wrap" id="reviews">
  <div class="g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 4))}
  </div>
</section>` : ''}

<section class="sec info" id="patient-info">
  <div class="wrap">${patientInfo(ctx)}</div>
</section>

<section class="cta wrap">
  <div class="cta__band g12" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <div class="cta__copy" data-reveal><p class="lead">${ctaText(ctx)}</p>${ctaActs(ctx)}</div>
  </div>
</section>

<section class="sec contact wrap" id="contact">
  ${contactSection(ctx)}
</section>
</main>

<footer class="foot">
  <div class="wrap">
    <p class="foot__name" aria-hidden="true">${fit(p.shortName)}</p>
    ${footFacts(ctx)}
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
