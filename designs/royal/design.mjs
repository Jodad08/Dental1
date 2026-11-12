// Royal: the familiar, trustworthy clinic site done cleanly. A blue contact
// bar, bold two-tone headings, and questions filed under topics.
import { html, rich, pic, headline, navList, book, callLink, menuButton, openStatus, secHead, doctorList, quote, quoteList, ratingBlock, topicBody, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, social, serviceList, statList, ctaActs, ctaText } from '../../build/kit.mjs';

export default {
  name: 'Royal',
  order: 13,
  summary: 'Clear and trustworthy. A blue contact bar, bold two-tone headings and questions filed under topics.',
  fonts: ['public-sans'],
  themeColor: '#2748f0',
  allow: ['card-rows'],
  defaults: {
    hero: { title: '*Dental care,*\nclearly explained' },
    about: { title: '*Why patients* choose us' },
    services: { title: '*Our services:* complete care', text: 'General, cosmetic and restorative dentistry for adults and children.' },
    doctors: { title: '*Meet our doctors:* the team', text: 'Qualified dentists who take the time to explain.' },
    reviews: { title: '*Patient reviews:* in their words' },
    patientInfo: { title: '*Patient info:* your questions', text: 'Choose a topic, or go straight to the common questions.' },
    cta: { title: 'Need to be seen today?' },
    contact: { title: '*Get in touch:* book a visit' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    const topics = c.patientInfo.topics;
    const faqs = c.patientInfo.faq;
    return html`
<div class="bar">
  <div class="wrap bar__in">
    <p>${p.tel ? html`<a href="${p.tel}">${p.phone}</a>` : ''}${p.mailto ? html`<a class="bar__hide" href="${p.mailto}">${p.email}</a>` : ''}${p.addressLine ? html`<span class="bar__hide">${p.addressLine}</span>` : ''}</p>
    ${social(ctx)}
  </div>
</div>
<header class="top wrap">
  <a class="brand" href="#main">${p.name}</a>
  ${navList(ctx)}
  ${book(ctx, 'btn top__book')}
  ${menuButton(ctx)}
</header>

<main id="main">
<section class="hero">
  <div class="wrap g12">
    <div class="hero__copy">
      <h1>${headline(c.hero.title)}</h1>
      <p class="lead" data-load style="--d:380ms">${rich(c.hero.text)}</p>
      <div class="acts" data-load style="--d:460ms">${book(ctx)}${callLink(ctx)}</div>
      <p class="hero__open" data-load style="--d:540ms"><strong>${openStatus(ctx)}</strong></p>
    </div>
    <figure class="hero__pic frame" data-drift>${pic(ctx, c.img.hero, { eager: true })}</figure>
  </div>
</section>

${c.stats.length ? html`<section class="strip" aria-label="${p.name} in figures"><div class="wrap">${statList(ctx)}</div></section>` : ''}

<section class="sec services wrap" id="services">
  ${secHead(c.services, 'head g12')}
  ${serviceList(ctx)}
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

${lead ? html`<section class="sec reviews" id="reviews">
  <div class="wrap g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 4))}
  </div>
</section>` : ''}

<section class="sec info wrap" id="patient-info">
  ${secHead(c.patientInfo, 'center')}
  <div class="files g12" data-pick data-reveal>
    <div class="files__panes">
      ${faqs.length ? html`<div class="files__pane is-on" role="tabpanel" data-pick-show="faq" data-pick-hide>${faqs.map((f, i) => html`<details class="q" name="royal-faq"${i === 0 ? ' open' : ''}><summary><span>${f.q}</span></summary><div class="q__a"><p>${rich(f.a)}</p></div></details>`)}</div>` : ''}
      ${topics.map((t, i) => html`<div class="files__pane${i === 0 && !faqs.length ? ' is-on' : ''}" role="tabpanel" data-pick-show="t${i}" data-pick-hide><h3>${t.title}</h3>${topicBody(t)}</div>`)}
    </div>
    <div class="files__tabs" role="tablist" aria-label="${c.patientInfo.title}">
      ${faqs.length ? html`<button type="button" role="tab" aria-selected="true" class="is-on" data-pick-item="faq">${L.questions}</button>` : ''}
      ${topics.map((t, i) => html`<button type="button" role="tab" aria-selected="${i === 0 && !faqs.length}" class="${i === 0 && !faqs.length ? 'is-on' : ''}" data-pick-item="t${i}">${t.title}</button>`)}
    </div>
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
