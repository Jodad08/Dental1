// Lilac: a white sheet on soft grey, navigation as a row of pills, a rounded
// photograph for the first screen and services as a cluster of unlike tiles.
import { footer, patientInfo, contactSection, html, rich, pic, headline, navLinks, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicBody, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Lilac',
  order: 9,
  summary: 'Soft and modern. Pill navigation, a rounded photograph and services as a cluster of tiles in lilac and pale blue.',
  fonts: ['red-hat-display', 'red-hat-text'],
  themeColor: '#efeff2',
  // The reference is built on a violet accent and pill navigation; both are kept.
  allow: ['palette-purple', 'pill-nav', 'card-rows'],
  defaults: {
    hero: { title: 'Daily care for\na healthy smile' },
    about: { title: 'About the practice' },
    services: { title: 'Our services' },
    doctors: { title: 'Meet our doctors' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info' },
    cta: { title: 'Seen the same day' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    const links = navLinks(ctx);
    const half = Math.ceil((links.length - 1) / 2);
    const items = c.services.items;
    return html`
<div class="sheet">
<header class="top">
  <nav class="nav nav--a" aria-label="Main">${links.slice(0, half).map((l) => html`<a href="${l.href}">${l.label}</a>`)}</nav>
  <a class="brand" href="#main">${p.name}</a>
  <nav class="nav nav--b" aria-label="More">${links.slice(half, -1).map((l) => html`<a href="${l.href}">${l.label}</a>`)}</nav>
  ${book(ctx, 'btn top__book')}
  ${menuButton(ctx)}
</header>

<main id="main">
<section class="hero">
  <div class="hero__card">
    <div class="hero__media" data-drift>${pic(ctx, c.img.hero, { eager: true })}</div>
    <div class="hero__body">
      <h1>${headline(c.hero.title)}</h1>
      <div class="acts" data-load style="--d:440ms">${book(ctx, 'btn btn--dark')}${p.tel ? html`<a class="btn btn--white" href="${p.tel}">${L.call} ${p.phone}</a>` : ''}</div>
    </div>
    <p class="hero__chip" data-load style="--d:520ms"><strong>${openStatus(ctx)}</strong></p>
  </div>
  <p class="hero__text lead">${rich(c.hero.text)}</p>
</section>

<section class="sec services" id="services">
  <div class="services__head" data-stagger>
    <h2 data-reveal>${rich(c.services.title)}</h2>
  </div>
  <ul class="cluster" data-stagger>${items.map(
    (s, i) => html`<li class="k k--${(i % 8) + 1}" data-reveal>
      <h3>${s.name}</h3>
      ${i % 8 === 1 || i % 8 === 4 ? html`<p>${s.text}</p>` : ''}
      ${s.price ? html`<p class="k__price">${s.price}</p>` : ''}
    </li>`,
  )}</ul>
</section>

<section class="sec about g12" id="about">
  <div class="about__copy" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <p class="lead" data-reveal>${rich(c.about.text)}</p>
    ${c.stats.length ? html`<dl class="figs" data-reveal>${c.stats.slice(0, 3).map((s) => html`<div><dt>${s.value}</dt><dd>${s.label}</dd></div>`)}</dl>` : ''}
  </div>
  <figure class="about__pic frame" data-reveal="open">${pic(ctx, c.img.care)}</figure>
</section>

<section class="sec doctors" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

<section class="sec info" id="patient-info">
  ${patientInfo(ctx)}
</section>

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 4))}
  </div>
</section>` : ''}

<section class="cta">
  <div class="cta__band g12" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <div class="cta__copy" data-reveal><p class="lead">${ctaText(ctx)}</p>${ctaActs(ctx)}</div>
  </div>
</section>

<section class="sec contact" id="contact">
  ${contactSection(ctx)}
</section>
</main>

<footer class="foot">
  ${footer(ctx, 'hours')}
</footer>
</div>`;
  },
};
