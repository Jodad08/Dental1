// Bento: white panels on a field of blue, heavy blue headlines, doctors in
// leaf-shaped frames. Each section is its own panel.
import { patientInfo, contactSection, html, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, serviceList, statList, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Bento',
  order: 12,
  summary: 'Direct and confident. White panels on a field of blue, heavy blue headlines, doctors in leaf-shaped frames.',
  fonts: ['onest'],
  themeColor: '#1447f0',
  allow: ['card-rows'],
  defaults: {
    hero: { title: 'Dental clinic\nfor the family' },
    about: { title: 'Why patients stay' },
    services: { title: 'Our services' },
    doctors: { title: 'Meet our doctors' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info' },
    cta: { title: 'Book a visit today' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<div class="stack wrap">
<header class="panel hero">
  <div class="top">
    <a class="brand" href="#main">${p.name}</a>
    ${navList(ctx)}
    ${menuButton(ctx)}
  </div>
  <h1>${headline(c.hero.title)}</h1>
  <div class="hero__row">
    <p class="hero__text" data-load style="--d:400ms">${rich(c.hero.text)}</p>
    <div class="hero__act" data-load style="--d:480ms">
      <p><strong>${openStatus(ctx)}</strong></p>
      ${book(ctx)}
    </div>
  </div>
  <figure class="hero__pic frame" data-drift>${pic(ctx, c.img.hero, { eager: true })}</figure>
</header>

<main id="main" class="stack">
<section class="panel doctors" id="doctors">
  ${secHead(c.doctors, 'head')}
  <ul class="docs" data-stagger>${c.doctors.items.map(
    (d) => html`<li data-reveal><div class="docs__pic frame">${pic(ctx, d.photo, { name: d.name, alt: d.name })}</div><h3>${d.name}</h3><p class="docs__role">${d.role}</p><p>${d.bio}</p></li>`,
  )}</ul>
</section>

<section class="panel services" id="services">
  ${secHead(c.services, 'head')}
  ${serviceList(ctx)}
</section>

<section class="duo" id="about">
  <div class="panel about" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <p data-reveal>${rich(c.about.text)}</p>
    ${statList(ctx)}
  </div>
  <div class="panel panel--blue cta" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <p class="lead" data-reveal>${ctaText(ctx)}</p>
    <div data-reveal>${ctaActs(ctx)}</div>
  </div>
</section>

${lead ? html`<section class="panel reviews" id="reviews">
  <div class="reviews__top">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
  </div>
  ${quoteList(ctx, rest.slice(0, 4))}
</section>` : ''}

<section class="panel info" id="patient-info">
  ${patientInfo(ctx)}
</section>

<section class="panel contact" id="contact">
  ${contactSection(ctx)}
</section>
</main>

<footer class="foot">
  <p class="foot__name" aria-hidden="true">${fit(p.shortName)}</p>
  ${footFacts(ctx)}
  ${legal(ctx)}
</footer>
</div>`;
  },
};
