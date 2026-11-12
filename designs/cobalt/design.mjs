// Cobalt: a full-width photograph under a white pill of navigation, then the
// practice's own figures laid out as a board of tiles around one blue card.
import { html, rich, pic, headline, navList, book, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, ctaActs, ctaText } from '../../build/kit.mjs';

// A bar is drawn only where the figure really is a share: a percentage, or a rating out of five.
function share(value) {
  const n = parseFloat(String(value).replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  if (/%/.test(value)) return Math.min(100, n);
  if (n <= 5 && /\./.test(value)) return (n / 5) * 100;
  return null;
}

export default {
  name: 'Cobalt',
  order: 3,
  summary: 'Bright and precise. A full-width photograph, a floating white menu and the practice’s figures as a board of tiles.',
  fonts: ['geist'],
  themeColor: '#f3f4f6',
  // The reference's navigation is a floating white pill; kept (solid, no blur).
  allow: ['pill-nav', 'card-rows'],
  defaults: {
    hero: { title: 'Skilled, careful\ndental experts' },
    about: { title: 'The practice in figures' },
    services: { title: 'Our services', text: 'Everything from a routine clean to a full implant, with the fee beside it.' },
    doctors: { title: 'Meet our doctors', text: 'Each dentist keeps to the work they do best.' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info', text: 'What happens at a first visit, and what it costs.' },
    cta: { title: 'Book your visit' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="hero">
  <div class="hero__media" data-drift>${pic(ctx, c.img.hero, { eager: true })}</div>
  <div class="wrap hero__in">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'btn top__book')}
      ${menuButton(ctx)}
    </div>
    <div class="hero__body">
      <div class="hero__title">
        <h1>${headline(c.hero.title)}</h1>
        <div data-load style="--d:420ms">${book(ctx, 'btn btn--white')}</div>
      </div>
      <div class="hero__card" data-load style="--d:480ms">
        <p>${rich(c.hero.text)}</p>
        <p><strong>${openStatus(ctx)}</strong></p>
      </div>
    </div>
  </div>
</header>

<main id="main">
<section class="sec board wrap" id="about">
  <div class="board__head" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
  </div>
  <div class="board__grid" data-stagger>
    ${c.stats.slice(0, 3).map((s, i) => {
      const pct = share(s.value);
      return html`<div class="tile tile--${i + 1}" data-reveal>
        <p class="tile__value">${s.value}</p>
        <p class="tile__label">${s.label}</p>
        ${pct != null ? html`<div class="bar" role="img" aria-label="${s.value}"><span style="width:${pct.toFixed(1)}%"></span></div>` : ''}
      </div>`;
    })}
    <div class="tile tile--cta" data-reveal>
      <p class="tile__big">${rich(c.cta.title)}</p>
      <p>${ctaText(ctx)}</p>
      ${book(ctx, 'btn btn--white')}
    </div>
    <div class="tile tile--team" data-reveal>
      <p class="tile__label">${c.doctors.items.length} ${L.nav.doctors.toLowerCase()}</p>
      <ul class="team">${c.doctors.items.map((d) => html`<li>${pic(ctx, d.photo, { name: d.name, alt: d.name })}</li>`)}</ul>
      <a class="link" href="#doctors">${c.doctors.title}</a>
    </div>
  </div>
  <p class="board__about lead" data-reveal>${rich(c.about.text)}</p>
</section>

<section class="sec services wrap" id="services">
  <div class="g12">
    <div class="services__side" data-stagger>
      <h2 data-reveal>${rich(c.services.title)}</h2>
      <p data-reveal>${rich(c.services.text)}</p>
      <figure class="frame services__pic" data-reveal="open">${pic(ctx, c.img.care)}</figure>
    </div>
    <ul class="menu" data-stagger>${c.services.items.map((s) => html`<li data-reveal><h3>${s.name}</h3><p>${s.text}</p>${s.price ? html`<p class="menu__price">${s.price}</p>` : ''}</li>`)}</ul>
  </div>
</section>

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="wrap g12">
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

<section class="sec contact" id="contact">
  <div class="wrap g12">
    <div class="contact__left" data-stagger>
      <h2 data-reveal>${rich(c.contact.title)}</h2>
      <p class="lead" data-reveal>${rich(c.contact.text)}</p>
      <div data-reveal>${contactFacts(ctx)}</div>
      ${p.emergency ? html`<div class="contact__urgent" data-reveal><p>${p.emergency}</p>${ctaActs(ctx)}</div>` : ''}
    </div>
    <div class="contact__form" data-reveal>${contactForm(ctx)}</div>
  </div>
  <div class="wrap">${mapEmbed(ctx)}</div>
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
