// Precision: a sky for a first screen, very large light type and the practice
// itself seen through a row of standing slats.
import { html, raw, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicRows, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText, url } from '../../build/kit.mjs';

// One picture cut into standing bars of different heights (a clip-path, so any photograph works).
const HEIGHTS = [70, 84, 100, 92, 96, 78];
function slats() {
  const n = HEIGHTS.length;
  const gap = 1.6;
  const w = (100 - gap * (n - 1)) / n;
  const pts = [];
  HEIGHTS.forEach((h, i) => {
    const x0 = i * (w + gap);
    const x1 = x0 + w;
    const top = 100 - h;
    pts.push(`${x0.toFixed(2)}% 100%`, `${x0.toFixed(2)}% ${top}%`, `${x1.toFixed(2)}% ${top}%`, `${x1.toFixed(2)}% 100%`);
  });
  return `polygon(${pts.join(',')})`;
}

export default {
  name: 'Precision',
  order: 4,
  summary: 'Quiet and exact. A sky-blue first screen, very large light type and the practice seen through standing slats.',
  fonts: ['stack-sans-headline', 'stack-sans-text'],
  themeColor: '#4d74c4',
  // The reference's first screen is a sky that fades to the horizon; that one gradient is kept.
  allow: ['gradient'],
  defaults: {
    hero: { title: 'Dentistry, down\nto the detail' },
    about: { title: 'Careful hands, new instruments' },
    services: { title: 'Our services', text: 'Each treatment with what it involves and what it costs.' },
    doctors: { title: 'Meet our doctors', text: 'Four clinicians. You will know yours by name.' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info', text: 'The practical side, answered before you ask.' },
    cta: { title: 'Seen the same day' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="hero">
  <div class="wrap hero__in">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'btn btn--white top__book')}
      ${menuButton(ctx)}
    </div>
    <h1>${headline(c.hero.title)}</h1>
    <div class="hero__foot">
      <p class="hero__text" data-load style="--d:420ms">${rich(c.hero.text)}</p>
      <figure class="slats" data-load style="--d:200ms">${c.img.clinic ? raw(`<img src="${url(ctx, c.img.clinic.src)}" alt="${c.img.clinic.alt}" fetchpriority="high" style="clip-path:${slats()}">`) : ''}</figure>
      <div class="hero__act" data-load style="--d:500ms">${book(ctx, 'btn btn--white')}${callLink(ctx)}</div>
    </div>
  </div>
</header>

<main id="main">
<section class="sec about" id="about">
  <div class="wrap">
    <div class="g12 about__top" data-stagger>
      <h2 data-reveal>${rich(c.about.title)}</h2>
      <div class="about__text" data-reveal><p>${rich(c.about.text)}</p><p><a class="btn" href="#doctors">${c.doctors.title}</a></p></div>
    </div>
    <figure class="about__wide frame" data-reveal="open" data-drift>${pic(ctx, c.img.hero)}</figure>
    <div class="about__note" data-reveal><p><strong>${openStatus(ctx)}</strong></p><p>${p.addressLine}</p></div>
    <dl class="spec" data-stagger>${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
  </div>
</section>

<section class="sec services" id="services">
  <div class="wrap g12">
    ${secHead(c.services, 'services__head')}
    <ul class="rows" data-stagger>${c.services.items.map((s) => html`<li data-reveal><h3>${s.name}</h3><p>${s.text}</p>${s.price ? html`<p class="rows__price">${s.price}</p>` : ''}</li>`)}</ul>
  </div>
</section>

${c.stats.length ? html`<section class="figures" aria-label="${p.name} in figures"><div class="wrap"><p class="figures__line" data-reveal>${c.stats.map((s, i) => html`${i ? ', ' : ''}<strong>${s.value}</strong> ${s.label}`)}.</p></div></section>` : ''}

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="wrap g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 3))}
  </div>
</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${secHead(c.patientInfo, 'head g12')}
  <div class="g12 info__body">
    ${topicRows(ctx)}
    ${c.patientInfo.faq.length ? html`<div class="info__faq" data-reveal><h3>${L.questions}</h3>${faq(ctx)}</div>` : ''}
  </div>
</section>

<section class="cta">
  <div class="wrap g12" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <div class="cta__copy" data-reveal><p class="lead">${ctaText(ctx)}</p>${ctaActs(ctx)}</div>
  </div>
</section>

<section class="sec contact wrap" id="contact">
  <div class="g12">
    <div class="contact__left" data-stagger>
      <h2 data-reveal>${rich(c.contact.title)}</h2>
      <p class="lead" data-reveal>${rich(c.contact.text)}</p>
      <div data-reveal>${contactFacts(ctx)}</div>
    </div>
    <div class="contact__form" data-reveal>${contactForm(ctx)}</div>
  </div>
  ${mapEmbed(ctx)}
</section>
</main>

<footer class="foot">
  <div class="wrap">
    ${footFacts(ctx)}
    <p class="foot__name" aria-hidden="true">${fit(p.shortName)}</p>
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
