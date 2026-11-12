// Titanium: a steel-blue field, light grotesk type at great size and a drawn
// implant standing in the middle of the first screen.
import { html, raw, rich, pic, headline, navList, book, callLink, menuButton, secHead, doctorList, quote, quoteList, ratingBlock, topicTabs, faq, contactFacts, contactForm, mapEmbed, footFacts, fit, legal, serviceList, statList, ctaActs, ctaText } from '../../build/kit.mjs';

// The practice's own object, drawn flat in the palette: crown, abutment, screw.
const threads = [0, 1, 2, 3, 4, 5, 6]
  .map((i) => {
    const y = 472 + i * 38;
    const k = (y - 440) * 0.085;
    return `<path d="M${136 + k} ${y}L${264 - k} ${y + 12}L${264 - k} ${y + 27}L${136 + k} ${y + 15}Z"/>`;
  })
  .join('');
const IMPLANT = `<svg class="implant" viewBox="0 0 400 780" role="img" aria-label="A dental implant: a crown on a titanium screw">
<path fill="#f3f5f8" d="M90 150C80 70 150 30 200 62C250 30 320 70 310 150C305 215 280 262 250 272L150 272C120 262 95 215 90 150Z"/>
<path fill="#d6dce5" d="M200 62C250 30 320 70 310 150C305 215 280 262 250 272L200 272Z"/>
<path fill="#c3cad6" d="M200 62C190 92 192 118 200 140C208 118 210 92 200 62Z"/>
<path fill="#bfc5ce" d="M160 286L240 286L262 402L138 402Z"/>
<path fill="#9ea6b2" d="M200 286L240 286L262 402L200 402Z"/>
<ellipse fill="#d5dae1" cx="200" cy="286" rx="40" ry="9"/>
<rect fill="#8a929e" x="118" y="402" width="164" height="40" rx="6"/>
<path fill="#6d7581" d="M200 402h76a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6h-76Z"/>
<path fill="#9aa2ae" d="M134 442L266 442L241 742Q200 772 159 742Z"/>
<path fill="#7b838f" d="M200 442L266 442L241 742Q222 756 200 760Z"/>
<g fill="#5f6672">${threads}</g>
</svg>`;

export default {
  name: 'Titanium',
  order: 1,
  summary: 'Clinical and exact. A steel-blue first screen with a drawn implant and very light, very large type.',
  fonts: ['hanken-grotesk'],
  themeColor: '#8fa3c2',
  allow: ['card-rows'],
  defaults: {
    hero: { title: 'Exceptional care,\n*straighter smiles*' },
    about: { title: 'A plan before any treatment' },
    services: { title: 'Our services', text: 'General, cosmetic and implant dentistry in one practice, each with its fee stated up front.' },
    doctors: { title: 'Meet our doctors', text: 'The people who will actually be looking after you.' },
    reviews: { title: 'Patient reviews' },
    patientInfo: { title: 'Patient info', text: 'First visits, insurance, fees and forms.' },
    cta: { title: 'Need to be seen today?' },
    contact: { title: 'Get in touch' },
  },
  render(ctx) {
    const { c, L } = ctx;
    const p = c.practice;
    const [lead, ...rest] = c.reviews.items;
    return html`
<header class="hero wrap">
  <div class="hero__field">
    <div class="top">
      <a class="brand" href="#main">${p.name}</a>
      ${navList(ctx)}
      ${book(ctx, 'btn top__book')}
      ${menuButton(ctx)}
    </div>
    <h1>${headline(c.hero.title)}</h1>
    <div class="hero__obj" data-load style="--d:200ms">${raw(IMPLANT)}</div>
    <div class="hero__copy" data-load style="--d:420ms">
      <p>${rich(c.hero.text)}</p>
      <div class="acts">${book(ctx)}${callLink(ctx)}</div>
    </div>
    ${c.stats.length ? html`<dl class="hero__figs" data-load style="--d:520ms">${c.stats.slice(0, 2).map((s) => html`<div><dt>${s.value}</dt><dd>${s.label}</dd></div>`)}</dl>` : ''}
    <p class="hero__mark" aria-hidden="true">${fit(p.shortName)}</p>
  </div>
</header>

<main id="main">
${c.stats.length ? html`<section class="strip wrap" aria-label="${p.name} in figures">${statList(ctx)}</section>` : ''}

<section class="services wrap" id="services">
  <div class="dark">
    ${secHead(c.services, 'head g12')}
    ${serviceList(ctx, 'sv', { items: c.services.items.slice(0, 6) })}
    ${c.services.items.length > 6 ? html`<p class="services__more">${c.services.items.slice(6).map((s) => s.name).join(', ')} too. ${book(ctx, 'link')}</p>` : ''}
  </div>
</section>

<section class="sec about wrap g12" id="about">
  <div class="about__copy" data-stagger>
    <h2 data-reveal>${rich(c.about.title)}</h2>
    <p class="lead" data-reveal>${rich(c.about.text)}</p>
    <dl class="about__points">${c.about.points.map((pt) => html`<div data-reveal><dt>${pt.title}</dt><dd>${pt.text}</dd></div>`)}</dl>
  </div>
  <figure class="about__pic frame" data-reveal="open">${pic(ctx, c.img.care)}</figure>
</section>

<section class="sec doctors wrap" id="doctors">
  ${secHead(c.doctors, 'head g12')}
  ${doctorList(ctx)}
</section>

${lead ? html`<section class="reviews wrap" id="reviews">
  <div class="field g12">
    <div class="reviews__head" data-stagger><h2 data-reveal>${rich(c.reviews.title)}</h2>${ratingBlock(ctx)}</div>
    <div class="reviews__lead" data-reveal>${quote(ctx, lead)}</div>
    ${quoteList(ctx, rest.slice(0, 3))}
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
  <div class="dark g12" data-stagger>
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
  <div class="dark">
    <p class="foot__name" aria-hidden="true">${fit(p.shortName)}</p>
    ${footFacts(ctx)}
    ${legal(ctx)}
  </div>
</footer>`;
  },
};
