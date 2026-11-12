// Mint: a close-up smile across the first screen, grotesk headlines with an
// italic didone turn, lime buttons and a dark band for the services.
import { html, rich, pic, headline, navList, book, callLink, menuButton, secHead, doctorList, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, servicePick, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Mint',
  order: 6,
  summary: 'Fresh and editorial. A close-up smile, an italic turn in every headline and lime buttons.',
  fonts: ['libre-franklin', 'bodoni-moda'],
  themeColor: '#cdf5d6',
  // The reference turns part of each headline into an italic serif; kept as its signature.
  allow: ['mixed-font-headline', 'card-rows'],
  defaults: {
    hero: { title: 'Healthy smiles\n*start here*' },
    about: { title: 'What we *stand for*' },
    services: { title: 'Our services, *for every smile*', text: 'Choose a treatment to see what it involves.' },
    doctors: { title: 'Meet *our doctors*', text: 'Four dentists, one standard of care.' },
    reviews: { title: 'Patient *reviews*' },
    patientInfo: { title: 'Patient *info*', text: 'First visits, insurance, fees and forms.' },
    cta: { title: 'Something *hurts?*' },
    contact: { title: 'Get *in touch*' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    const faces = [c.img.portrait, c.reviews.items[1]?.photo || c.img.care];
    return html`
<div class="sheet">
<header class="hero">
  <div class="hero__media" data-drift>${pic(ctx, c.img.smile, { eager: true })}</div>
  <div class="hero__in">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'btn btn--white top__book')}
      ${menuButton(ctx)}
    </div>
    <div class="hero__body">
      <div class="hero__title">
        <h1>${headline(c.hero.title)}</h1>
        <div data-load style="--d:440ms">${book(ctx)}</div>
      </div>
      ${c.reviews.rating ? html`<div class="hero__card" data-load style="--d:520ms"><p class="hero__score">${c.reviews.rating}</p><p>${c.reviews.count} ${L.reviewsOn} ${c.reviews.source}</p></div>` : ''}
    </div>
  </div>
</header>

<main id="main">
<section class="sec intro wrap">
  <figure class="intro__pic frame" data-reveal="open">${pic(ctx, faces[0])}</figure>
  <div class="intro__text" data-stagger>
    <p class="intro__say" data-reveal>${rich(c.hero.text)}</p>
    <p data-reveal>${callLink(ctx)}</p>
  </div>
  <figure class="intro__pic frame" data-reveal="open">${pic(ctx, faces[1])}</figure>
</section>

<section class="values wrap g12" id="about">
  <dl class="values__grid" data-stagger>${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
  <div class="values__copy" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <p data-reveal>${rich(c.about.text)}</p>
  </div>
</section>

<section class="sec services" id="services">
  <div class="wrap">
    ${secHead(c.services, 'head g12')}
    ${servicePick(ctx)}
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
    <p class="foot__name" aria-hidden="true">${fit(p.shortName)}</p>
    ${footFacts(ctx)}
    ${legal(ctx)}
  </div>
</footer>
</div>`;
  },
};
