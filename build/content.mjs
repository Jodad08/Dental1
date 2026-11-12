// Loads content/site.jsonc, layers it over a design's default wording, and
// normalises it so templates never have to guard against missing fields.
import fs from 'node:fs';
import path from 'node:path';

/** JSON with // and /* comments and trailing commas. */
export function parseJsonc(text, file = 'site.jsonc') {
  let out = '';
  let i = 0;
  let inStr = false;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (inStr) {
      out += ch;
      if (ch === '\\') out += text[++i] ?? '';
      else if (ch === '"') inStr = false;
      i++;
    } else if (ch === '"') {
      inStr = true;
      out += ch;
      i++;
    } else if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i++;
    } else if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const chunk = text.slice(i, end === -1 ? text.length : end + 2);
      out += chunk.replace(/[^\n]/g, ' ');
      i += chunk.length;
    } else {
      out += ch;
      i++;
    }
  }
  out = out.replace(/,(\s*[}\]])/g, '$1');
  try {
    return JSON.parse(out);
  } catch (err) {
    const pos = Number(/position (\d+)/.exec(err.message)?.[1]);
    let where = '';
    if (Number.isFinite(pos)) {
      const before = out.slice(0, pos).split('\n');
      where = ` (line ${before.length}, column ${before.at(-1).length + 1})`;
    }
    throw new Error(`${file} is not valid JSON${where}: ${err.message}`);
  }
}

export function loadContent(dir) {
  const file = ['site.jsonc', 'site.json'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  if (!file) throw new Error(`No site.jsonc found in ${dir}`);
  return parseJsonc(fs.readFileSync(file, 'utf8'), path.relative(process.cwd(), file));
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/** Deep merge where empty values in `over` never erase a value in `base`. */
export function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return empty(over) ? base : over;
  const res = { ...base };
  for (const [k, v] of Object.entries(over)) res[k] = k in base ? merge(base[k], v) : v;
  return res;
}

// Words the templates print that are not part of any one section. Override
// any of them under "labels" in site.jsonc (for example to translate a site).
export const LABELS = {
  book: 'Book a visit',
  call: 'Call',
  callUs: 'Call us',
  visitUs: 'Visit us',
  whatsapp: 'WhatsApp',
  directions: 'Directions',
  menu: 'Menu',
  close: 'Close',
  skip: 'Skip to content',
  nav: { services: 'Services', doctors: 'Doctors', reviews: 'Reviews', patientInfo: 'Patient info', contact: 'Contact' },
  hours: 'Opening hours',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  closed: 'Closed',
  openNow: 'Open now',
  closedNow: 'Closed now',
  closes: 'closes',
  opens: 'opens',
  today: 'today',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  from: 'from',
  ratingOf: 'out of 5',
  reviewsOn: 'reviews on',
  allReviews: 'Read all reviews',
  questions: 'Common questions',
  form: {
    name: 'Your name',
    phone: 'Phone',
    email: 'Email',
    service: 'What do you need?',
    any: 'Not sure yet',
    message: 'Anything we should know?',
    submit: 'Request a visit',
    note: 'We reply within one working day.',
    sent: 'Thank you. We will be in touch shortly.',
    failed: 'That did not send. Please call us instead.',
    subject: 'Appointment request',
  },
  rights: 'All rights reserved.',
  top: 'Back to top',
};

// Wording used when neither the design nor site.jsonc gives any.
export const COPY = {
  hero: { title: 'Dental care for\nthe whole family', text: '' },
  about: { title: 'About the practice' },
  services: { title: 'Our services', text: '' },
  doctors: { title: 'Meet our doctors', text: '' },
  reviews: { title: 'Patient reviews', text: '' },
  patientInfo: { title: 'Patient info', text: '' },
  contact: { title: 'Get in touch', text: '' },
  cta: { title: 'Book your visit', text: '' },
};

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function fmtTime(t, fmt) {
  const [h, m] = String(t).split(':').map(Number);
  if (fmt === 24) return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${suffix}`;
}

function hoursModel(practice, L) {
  const fmt = Number(practice.hourFormat) === 24 ? 24 : 12;
  const src = isObj(practice.hours) ? practice.hours : {};
  const days = DAY_KEYS.map((k) => {
    const v = src[k];
    return Array.isArray(v) && v.length >= 2 ? [String(v[0]), String(v[1])] : null;
  });
  const any = days.some(Boolean);
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const key = days[i] ? days[i].join('-') : 'x';
    const last = rows.at(-1);
    if (last && last.key === key) last.to = i;
    else rows.push({ key, from: i, to: i, span: days[i] });
  }
  return {
    any,
    format: fmt,
    rows: rows.map((r) => ({
      days: r.from === r.to ? L.days[r.from] : `${L.days[r.from]}–${L.days[r.to]}`,
      time: r.span ? `${fmtTime(r.span[0], fmt)} – ${fmtTime(r.span[1], fmt)}` : L.closed,
      closed: !r.span,
    })),
    // Read by shared/site.js to print "Open now · closes 6 pm" for each visitor.
    data: JSON.stringify({
      d: days,
      tz: practice.timezone || '',
      f: fmt,
      l: { o: L.openNow, c: L.closedNow, cl: L.closes, op: L.opens, t: L.today, days: L.days },
    }),
    schema: days
      .map((d, i) => d && { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i], opens: d[0], closes: d[1] })
      .filter(Boolean),
  };
}

const image = (v) => {
  if (!v) return null;
  if (typeof v === 'string') return { src: v, alt: '', position: '' };
  return v.src ? { src: v.src, alt: v.alt || '', position: v.position || '' } : null;
};

const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const str = (v) => (v == null ? '' : String(v).trim());
const section = (v) => ({ title: '', text: '', ...(isObj(v) ? v : {}) });

/**
 * Resolve the content for one design: the design's default wording, then the
 * client's site.jsonc, then any per-design overrides from site.jsonc.
 */
export function resolve(site, design) {
  let c = merge(merge(COPY, design.defaults || {}), site);
  c = merge(c, site.perDesign?.[design.slug] || {});
  const L = merge(LABELS, c.labels || {});

  const p = { ...(c.practice || {}) };
  p.name = str(p.name) || 'Your Practice';
  p.shortName = str(p.shortName) || p.name;
  p.kind = str(p.kind);
  p.phone = str(p.phone);
  p.email = str(p.email);
  p.tel = p.phone ? 'tel:' + p.phone.replace(/[^\d+]/g, '') : '';
  p.mailto = p.email ? 'mailto:' + p.email : '';
  p.whatsapp = str(p.whatsapp);
  p.wa = p.whatsapp ? 'https://wa.me/' + p.whatsapp.replace(/\D/g, '') : '';
  const a = isObj(p.address) ? p.address : {};
  p.address = { street: str(a.street), city: str(a.city), region: str(a.region), postal: str(a.postal), country: str(a.country) };
  p.cityLine = [p.address.city, [p.address.region, p.address.postal].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  p.addressLines = [p.address.street, p.cityLine].filter(Boolean);
  p.addressLine = p.addressLines.join(', ');
  p.city = p.address.city;
  p.mapUrl = str(p.mapUrl) || (p.addressLine ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${p.name}, ${p.addressLine}`) : '');
  p.mapEmbedUrl = str(p.mapEmbedUrl);
  p.bookingUrl = str(p.bookingUrl) || '#contact';
  p.bookingExternal = /^https?:/.test(p.bookingUrl);
  p.emergency = str(p.emergency);
  p.social = Object.entries(isObj(p.social) ? p.social : {})
    .filter(([, url]) => str(url))
    .map(([name, url]) => ({ name, url: str(url) }));

  const imgs = isObj(c.images) ? c.images : {};
  const slot = (...names) => names.map((n) => image(imgs[n])).find(Boolean) || null;
  const img = {
    logo: slot('logo'),
    hero: slot('hero', 'clinic', 'care', 'smile'),
    smile: slot('smile', 'hero', 'portrait'),
    portrait: slot('portrait', 'smile', 'hero'),
    clinic: slot('clinic', 'hero', 'care'),
    care: slot('care', 'clinic', 'hero'),
    detail: slot('detail', 'care', 'clinic', 'hero'),
  };

  const services = section(c.services);
  services.items = list(services.items).map((s) => ({ name: str(s.name), text: str(s.text), price: str(s.price), category: str(s.category), image: image(s.image) }));
  services.categories = [...new Set(services.items.map((s) => s.category).filter(Boolean))];

  const doctors = section(c.doctors);
  doctors.items = list(doctors.items).map((d) => ({ name: str(d.name), role: str(d.role), bio: str(d.bio), photo: image(d.photo) }));

  const reviews = section(c.reviews);
  reviews.items = list(reviews.items).map((r) => ({ quote: str(r.quote), name: str(r.name), detail: str(r.detail), photo: image(r.photo) }));
  reviews.rating = str(reviews.rating);
  reviews.count = str(reviews.count);
  reviews.source = str(reviews.source);
  reviews.url = str(reviews.url);

  const patientInfo = section(c.patientInfo);
  patientInfo.topics = list(patientInfo.topics).map((t) => ({ title: str(t.title), text: str(t.text), points: list(t.points).map(str), links: list(t.links).map((l) => ({ label: str(l.label), href: str(l.href) })) }));
  patientInfo.faq = list(patientInfo.faq).map((f) => ({ q: str(f.q), a: str(f.a) }));

  const about = section(c.about);
  about.points = list(about.points).map((pt) => (typeof pt === 'string' ? { title: pt, text: '' } : { title: str(pt.title), text: str(pt.text) }));

  const contact = section(c.contact);
  contact.formAction = str(contact.formAction);

  const seo = { title: '', description: '', url: '', indexable: false, ...(isObj(c.seo) ? c.seo : {}) };
  const hero = section(c.hero);

  return {
    lang: str(c.lang) || 'en',
    demo: !!c.demo,
    practice: p,
    hours: hoursModel(p, L),
    img,
    hero,
    stats: list(c.stats).map((s) => ({ value: str(s.value), label: str(s.label) })),
    about,
    services,
    doctors,
    reviews,
    patientInfo,
    contact,
    cta: section(c.cta),
    credits: str(c.credits),
    theme: isObj(c.theme) ? c.theme : {},
    seo: {
      title: str(seo.title) || [p.name, p.kind, p.city].filter(Boolean).join(' · '),
      description: str(seo.description) || str(hero.text),
      url: str(seo.url).replace(/\/$/, ''),
      indexable: !!seo.indexable,
    },
    L,
  };
}

/** Every image path the content refers to (to check the files exist). */
export function imageRefs(c) {
  return [
    ...Object.values(c.img),
    ...c.services.items.map((s) => s.image),
    ...c.doctors.items.map((d) => d.photo),
    ...c.reviews.items.map((r) => r.photo),
  ].filter(Boolean);
}
