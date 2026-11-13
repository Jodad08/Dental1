// Sage: a calm, airy practice site. Soft green fields, one grotesk, rounded
// pictures, a tall portrait beside the headline.
import { footer, patientInfo, contactSection, html, rich, pic, headline, navList, book, callLink, menuButton, hoursTable, openStatus, stars, ratingLine, faq, topicBody, contactForm, social, mapEmbed, fit, legal } from '../../build/kit.mjs';

export default {
  name: 'Sage',
  order: 8,
  summary: 'Calm and airy. Soft green fields and a tall portrait beside the headline.',
  fonts: ['albert-sans'],
  themeColor: '#ffffff',
  // House rules this design sets aside because its reference depends on them.
  allow: ['card-rows'],
  defaults: {
    hero: { title: 'Feel good about\n*your smile*' },
    services: { title: 'Our services' },
    about: { title: 'Careful dentistry with a *human touch*' },
    doctors: { title: 'Meet our doctors' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info' },
    cta: { title: 'Something hurts today?' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    const tints = ['t1', 't2', 't3', 't4'];
    return html`
<header class="top wrap">
  <a class="brand" href="#main">${p.name}</a>
  ${navList(ctx)}
  ${book(ctx, 'btn btn--quiet top__book')}
  ${menuButton(ctx)}
</header>

<main id="main">
<section class="hero wrap g12">
  <div class="hero__copy">
    <h1>${headline(c.hero.title)}</h1>
    <p class="lead" data-load style="--d:380ms">${rich(c.hero.text)}</p>
    <div class="hero__act" data-load style="--d:460ms">${book(ctx)}${callLink(ctx)}</div>
    ${c.reviews.rating ? html`<p class="hero__proof" data-load style="--d:540ms"><span class="avatars">${c.reviews.items.slice(0, 4).map((r) => pic(ctx, r.photo, { name: r.name }))}</span><span>${stars(ctx)} ${ratingLine(ctx)}</span></p>` : ''}
  </div>
  <figure class="hero__pic frame" data-drift>${pic(ctx, c.img.portrait, { eager: true })}
    <figcaption class="chip">${openStatus(ctx)}</figcaption>
  </figure>
</section>

${c.stats.length ? html`<section class="stats wrap" aria-label="${p.name} in figures"><dl class="stats__list" data-stagger>${c.stats.map((s) => html`<div data-reveal><dt>${s.value}</dt><dd>${s.label}</dd></div>`)}</dl></section>` : ''}

<section class="sec services wrap" id="services">
  <div class="services__head" data-stagger>
    <h2 data-reveal>${rich(c.services.title)}</h2>
  </div>
  <ul class="services__grid" data-stagger>${c.services.items.map(
    (s, i) => html`<li class="tile ${tints[i % 4]}" data-reveal>
      <div class="tile__pic frame">${pic(ctx, s.image, { alt: s.name })}</div>
      <h3>${s.name}</h3>
      <p>${s.text}</p>
      ${s.price ? html`<p class="tile__price">${s.price}</p>` : ''}
    </li>`,
  )}</ul>
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
  <div class="split-head g12" data-stagger>
    <h2 data-reveal>${rich(c.doctors.title)}</h2>
  </div>
  <ul class="doctors__row" data-stagger>${c.doctors.items.map(
    (d) => html`<li data-reveal>
      <div class="doctors__pic frame">${pic(ctx, d.photo, { name: d.name, alt: d.name })}</div>
      <h3>${d.name}</h3>
      <p class="doctors__role">${d.role}</p>
      <p>${d.bio}</p>
    </li>`,
  )}</ul>
</section>

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="wrap g12">
    <div class="reviews__head" data-stagger>
      <h2 data-reveal>${rich(c.reviews.title)}</h2>
      ${c.reviews.rating ? html`<p data-reveal>${stars(ctx)} ${ratingLine(ctx)}</p>` : ''}
      ${c.reviews.url ? html`<p data-reveal><a class="link" href="${c.reviews.url}" target="_blank" rel="noopener">${L.allReviews}</a></p>` : ''}
    </div>
    <figure class="reviews__lead" data-reveal>
      <blockquote><p>“${lead.quote}”</p></blockquote>
      <figcaption>${pic(ctx, lead.photo, { cls: 'reviews__face', name: lead.name })}<span><strong>${lead.name}</strong><br>${lead.detail}</span></figcaption>
    </figure>
    <ul class="reviews__more" data-stagger>${rest.slice(0, 4).map((r) => html`<li data-reveal><blockquote><p>“${r.quote}”</p></blockquote><p class="reviews__by"><strong>${r.name}</strong>, ${r.detail}</p></li>`)}</ul>
  </div>
</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${patientInfo(ctx)}
</section>

<section class="cta wrap">
  <div class="cta__panel g12" data-stagger>
    <h2 data-reveal>${rich(c.cta.title)}</h2>
    <div class="cta__copy" data-reveal>
      <p class="lead">${p.emergency || c.cta.text || c.hero.text}</p>
      <div class="hero__act">${p.tel ? html`<a class="btn" href="${p.tel}">${L.call} ${p.phone}</a>` : book(ctx)}${p.tel ? book(ctx, 'link') : ''}</div>
    </div>
  </div>
</section>

<section class="sec contact wrap" id="contact">
  ${contactSection(ctx)}
</section>
</main>

<footer class="foot">
  <div class="wrap">${footer(ctx, 'card')}</div>
</footer>`;
  },
};
