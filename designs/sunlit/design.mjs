// Sunlit: one warm photograph filling the first screen and a heavy lowercase
// headline in chartreuse, on a stone ground.
import { html, rich, pic, headline, navList, book, menuButton, openStatus, secHead, doctorList, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Sunlit',
  order: 7,
  summary: 'Warm and bold. One sunlit photograph, a heavy lowercase headline in chartreuse, a stone ground.',
  fonts: ['league-spartan', 'figtree'],
  themeColor: '#26231c',
  allow: [],
  defaults: {
    hero: { title: 'a better smile\nstarts here' },
    about: { title: 'a little care goes far' },
    services: { title: 'our services', text: 'Everything a smile needs, from the first check-up on.' },
    doctors: { title: 'meet our doctors', text: 'Friendly, qualified and never in a rush.' },
    reviews: { title: 'patient reviews' },
    patientInfo: { title: 'patient info', text: 'What to bring and what it costs.' },
    cta: { title: 'it hurts today?' },
    contact: { title: 'get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="hero">
  <div class="hero__media" data-drift>${pic(ctx, c.img.smile, { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'btn top__book')}
      ${menuButton(ctx)}
    </div>
    <div class="hero__title">
      <h1>${headline(c.hero.title)}</h1>
      <div data-load style="--d:440ms">${book(ctx)}</div>
    </div>
  </div>
</header>
<div class="under wrap">
  <p class="under__text">${rich(c.hero.text)}</p>
  ${p.tel ? html`<p class="under__tel"><a href="${p.tel}">${p.phone}</a></p>` : ''}
  <p class="under__open"><strong>${openStatus(ctx)}</strong></p>
</div>

<main id="main">
<section class="sec about wrap g12" id="about">
  <div class="about__copy" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <p class="lead" data-reveal>${rich(c.about.text)}</p>
  </div>
  <figure class="about__pic frame" data-reveal="open">${pic(ctx, c.img.clinic)}</figure>
  <dl class="about__points" data-stagger>${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
</section>

<section class="sec services" id="services">
  <div class="wrap">
    ${secHead(c.services, 'head g12')}
    <ul class="tiles" data-stagger>${c.services.items.map(
      (s) => html`<li data-reveal><div class="tiles__pic frame">${pic(ctx, s.image, { alt: s.name })}</div><div class="tiles__txt"><h3>${s.name}</h3><p>${s.text}</p>${s.price ? html`<p class="tiles__price">${s.price}</p>` : ''}</div></li>`,
    )}</ul>
  </div>
</section>

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="reviews" id="reviews">
  <div class="reviews__media">${pic(ctx, c.img.portrait)}</div>
  <div class="reviews__body" data-stagger>
    <h2 data-reveal>${rich(c.reviews.title)}</h2>
    <blockquote data-reveal><p>“${lead.quote}”</p></blockquote>
    <p data-reveal><strong>${lead.name}</strong>, ${lead.detail}</p>
    ${ratingBlock(ctx)}
  </div>
</section>
<section class="more wrap" aria-label="${c.reviews.title}">${quoteList(ctx, rest.slice(0, 4))}</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${secHead(c.patientInfo, 'head g12')}
  <div class="g12 info__body">
    <div class="info__topics" data-reveal>${topicTabs(ctx)}</div>
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
    <p class="foot__name" aria-hidden="true">${fit(p.shortName.toLowerCase())}</p>
    ${footFacts(ctx)}
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
