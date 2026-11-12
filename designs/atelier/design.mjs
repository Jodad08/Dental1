// Atelier: charcoal and stone, one light grotesk, generous space. Dark and
// pale fields alternate; photographs are quiet and large.
import { html, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicRows, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, servicePick, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Atelier',
  order: 10,
  summary: 'Quiet luxury. Charcoal and stone, one light typeface, large calm photographs.',
  fonts: ['manrope'],
  themeColor: '#33302c',
  allow: [],
  defaults: {
    hero: { title: 'Modern dentistry,\n*refined around you*' },
    about: { title: 'Clinical confidence, *never clinical*' },
    services: { title: 'Our services, *crafted with care*', text: 'Care for health. Craft for confidence.' },
    doctors: { title: 'Meet our doctors', text: 'You should notice the person before the dentistry.' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info', text: 'A clear path from first conversation to final result.' },
    cta: { title: 'Finish well. *Follow through*' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="hero">
  <div class="hero__media" data-drift>${pic(ctx, c.img.clinic, { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'link top__book')}
      ${menuButton(ctx)}
    </div>
    <div class="hero__body">
      <h1>${headline(c.hero.title)}</h1>
      <div class="acts" data-load style="--d:460ms">${book(ctx, 'btn btn--paper')}${callLink(ctx)}</div>
    </div>
    <p class="hero__open" data-load style="--d:540ms">${openStatus(ctx)}</p>
  </div>
</header>

<main id="main">
<section class="sec about wrap" id="about">
  <div class="g12 about__top" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <div class="about__text" data-reveal><p>${rich(c.hero.text)}</p><p>${rich(c.about.text)}</p></div>
  </div>
  <dl class="about__points" data-stagger>${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
</section>

<section class="sec services" id="services">
  <div class="wrap">
    ${secHead(c.services, 'head g12')}
    ${servicePick(ctx)}
  </div>
</section>

<section class="plate">
  <figure class="plate__pic" data-reveal="open">${pic(ctx, c.img.smile)}</figure>
  <div class="plate__body" data-stagger>
    <p class="plate__say" data-reveal>${rich(c.doctors.text)}</p>
    ${c.stats.length ? html`<dl class="plate__figs" data-reveal>${c.stats.slice(0, 3).map((s) => html`<div><dt>${s.value}</dt><dd>${s.label}</dd></div>`)}</dl>` : ''}
  </div>
</section>

<section class="sec doctors wrap" id="doctors">
  <div class="head g12" data-stagger><h2 data-reveal>${rich(c.doctors.title)}</h2></div>
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="wrap g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead, 'quote', false)}</div>
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
  <div class="cta__media">${pic(ctx, c.img.detail)}</div>
  <div class="cta__body" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <p class="lead" data-reveal>${ctaText(ctx)}</p>
    <div data-reveal>${ctaActs(ctx)}</div>
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
    <p class="foot__name" aria-hidden="true">${fit(p.shortName.toUpperCase())}</p>
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
