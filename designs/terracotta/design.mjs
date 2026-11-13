// Terracotta: a cream sheet on a clay frame, a dark photograph for the first
// screen and the services as a list that shows each treatment's picture.
import { footer, patientInfo, contactSection, html, rich, pic, headline, navList, book, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicRows, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, servicePick, statList, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Terracotta',
  order: 2,
  summary: 'Warm and grounded. A clay frame, a dark full-width photograph, services as a picture list.',
  fonts: ['schibsted-grotesk'],
  themeColor: '#b85a32',
  // The reference is a cream page with a terracotta frame; the palette is kept.
  allow: ['palette-claude', 'palette-terracotta', 'palette-cream'],
  defaults: {
    hero: { title: 'Trusted\ndental care' },
    about: { title: 'Dentistry without the hurry' },
    services: { title: 'Our services' },
    doctors: { title: 'Meet our doctors' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info' },
    cta: { title: 'In pain today?' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<div class="sheet">
<header class="hero">
  <div class="hero__media" data-drift>${pic(ctx, c.img.hero, { eager: true })}</div>
  <div class="top">
    <a class="brand" href="#main">${p.name}</a>
    ${navList(ctx)}
    ${book(ctx, 'btn top__book')}
    ${menuButton(ctx)}
  </div>
  <div class="hero__body">
    <h1>${headline(c.hero.title)}</h1>
    <div class="hero__card" data-load style="--d:420ms">
      <p>${rich(c.hero.text)}</p>
      <p class="hero__open"><strong>${openStatus(ctx)}</strong></p>
      ${book(ctx)}
    </div>
  </div>
</header>

<main id="main">
<section class="sec about wrap g12" id="about">
  <div class="about__left" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    ${p.tel ? html`<p class="about__call" data-reveal>${L.book}<br><a href="${p.tel}">${p.phone}</a></p>` : ''}
  </div>
  <div class="about__right" data-stagger>
    <p class="lead" data-reveal>${rich(c.about.text)}</p>
    <ul class="about__team" data-reveal>${c.doctors.items.map((d) => html`<li class="frame">${pic(ctx, d.photo, { name: d.name, alt: d.name })}</li>`)}</ul>
    ${statList(ctx)}
  </div>
</section>

<section class="services wrap" id="services">
  <div class="panel">
    <div class="panel__head" data-stagger>
      <h2 data-reveal>${rich(c.services.title)}</h2>
      <p data-reveal>${book(ctx)}</p>
    </div>
    ${servicePick(ctx)}
  </div>
</section>

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="reviews wrap" id="reviews">
  <div class="reviews__split">
    <div class="reviews__name" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__quote" data-reveal>${quote(ctx, lead)}</div>
  </div>
  ${quoteList(ctx, rest.slice(0, 4))}
</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${patientInfo(ctx)}
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
  <div class="wrap">${footer(ctx, 'card')}</div>
</footer>
</div>`;
  },
};
