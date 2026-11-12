// Aligner: white, navy and pale blue. Wide capitals that switch between a
// light and a heavy weight, and one large rounded portrait.
import { html, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Aligner',
  order: 11,
  summary: 'Clean and clinical. Wide capitals in light and heavy weights, navy and pale blue, one large portrait.',
  fonts: ['urbanist'],
  themeColor: '#ffffff',
  allow: ['card-rows'],
  defaults: {
    hero: { title: 'Smart care for\n*modern smiles*' },
    about: { title: 'Made *for your comfort*' },
    services: { title: 'Our *services*', text: 'From a routine check-up to a full course of aligners.' },
    doctors: { title: 'Meet our *doctors*', text: 'Every smile is different. Your dentist should know yours.' },
    reviews: { title: 'Patient *reviews*' },
    patientInfo: { title: 'Patient *info*', text: 'How a first visit works and what it costs.' },
    cta: { title: 'Need help *today?*' },
    contact: { title: 'Get in *touch*' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="top wrap">
  <a class="brand" href="#main">${p.name}</a>
  ${navList(ctx)}
  ${p.tel ? html`<a class="top__tel" href="${p.tel}">${p.phone}</a>` : ''}
  ${menuButton(ctx)}
</header>

<main id="main">
<section class="hero wrap g12">
  <div class="hero__copy">
    <h1>${headline(c.hero.title)}</h1>
    <div class="hero__duo" data-load style="--d:400ms">
      <figure class="frame hero__small">${pic(ctx, c.img.detail)}</figure>
      <div class="hero__navy"><p>${rich(c.hero.text)}</p></div>
    </div>
    <div class="hero__bar" data-load style="--d:480ms">
      <p><strong>${openStatus(ctx)}</strong></p>
      ${book(ctx)}
    </div>
  </div>
  <figure class="hero__pic frame" data-drift>${pic(ctx, c.img.portrait, { eager: true })}</figure>
</section>

<section class="sec services wrap" id="services">
  ${secHead(c.services, 'center')}
  <ul class="list" data-stagger>${c.services.items.map((s) => html`<li data-reveal><h3>${s.name}</h3><p>${s.text}</p>${s.price ? html`<p class="list__price">${s.price}</p>` : ''}</li>`)}</ul>
</section>

<section class="sec about" id="about">
  <div class="wrap g12">
    <figure class="about__pic frame" data-reveal="open">${pic(ctx, c.img.care)}</figure>
    <div class="about__copy" data-stagger>
      <h2 data-reveal>${rich(c.about.title)}</h2>
      <p class="lead" data-reveal>${rich(c.about.text)}</p>
      <dl class="about__points">${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
    </div>
  </div>
</section>

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="reviews wrap" id="reviews">
  <div class="navy g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 4))}
  </div>
</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${secHead(c.patientInfo, 'head g12')}
  <div class="g12 info__body">
    <div class="info__topics" data-reveal>${topicTabs(ctx)}</div>
    ${c.patientInfo.faq.length ? html`<div class="info__faq" data-reveal><h3>${L.questions}</h3>${faq(ctx)}</div>` : ''}
  </div>
</section>

<section class="cta wrap">
  <div class="cta__band g12" data-stagger>
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

<footer class="foot wrap">
  <div class="navy">
    <p class="foot__name" aria-hidden="true">${fit(p.shortName.toUpperCase())}</p>
    ${footFacts(ctx)}
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
