// Shared behaviour for every design. No dependencies. Everything here adds to
// a page that already works without it.
(() => {
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- entrances: the parts of a section arrive in reading order, once
  $$('[data-stagger]').forEach((group) => {
    $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
  });
  const reveals = $$('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    reveals.forEach((el) => io.observe(el));
  }

  // --- phone menu
  const sheet = document.getElementById('mnav');
  const openers = $$('[data-menu]');
  const setMenu = (open) => {
    if (!sheet) return;
    sheet.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    openers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open) sheet.querySelector('[data-menu-close]')?.focus();
    else openers.find((b) => b.offsetParent)?.focus();
  };
  openers.forEach((b) => b.addEventListener('click', () => setMenu(true)));
  if (sheet) {
    sheet.addEventListener('click', (e) => {
      if (e.target.closest('[data-menu-close], a')) setMenu(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sheet.hidden) setMenu(false);
    });
  }

  // --- open now: worked out from the practice's real hours, in its own time zone
  const fmtTime = (t, f) => {
    const [h, m] = t.split(':').map(Number);
    if (f === 24) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'pm' : 'am'}`;
  };
  const mins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  $$('[data-open-status]').forEach((el) => {
    try {
      const { d, tz, f, l } = JSON.parse(el.dataset.openStatus);
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (type) => parts.find((p) => p.type === type).value;
      const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'));
      const now = Number(get('hour')) * 60 + Number(get('minute'));
      const today = d[day];
      if (today && now >= mins(today[0]) && now < mins(today[1])) {
        el.textContent = `${l.o} · ${l.cl} ${fmtTime(today[1], f)}`;
        el.dataset.state = 'open';
        return;
      }
      for (let i = 0; i < 8; i++) {
        const idx = (day + i) % 7;
        const span = d[idx];
        if (!span || (i === 0 && now >= mins(span[0]))) continue;
        el.textContent = `${l.c} · ${l.op} ${i === 0 ? l.t : l.days[idx]} ${fmtTime(span[0], f)}`;
        el.dataset.state = 'closed';
        return;
      }
    } catch {
      /* keep the printed hours */
    }
  });

  // --- pick one: lists whose rows show their own picture, tabs, question index
  $$('[data-pick]').forEach((root) => {
    const items = $$('[data-pick-item]', root);
    const shows = $$('[data-pick-show]', root);
    const choose = (key) => {
      items.forEach((it) => {
        const on = it.dataset.pickItem === key;
        it.classList.toggle('is-on', on);
        if (it.hasAttribute('aria-selected')) it.setAttribute('aria-selected', String(on));
        if (it.hasAttribute('aria-pressed')) it.setAttribute('aria-pressed', String(on));
      });
      shows.forEach((sh) => {
        const on = sh.dataset.pickShow === key || sh.dataset.pickShow.split(' ').includes(key);
        sh.classList.toggle('is-on', on);
        if (sh.hasAttribute('data-pick-hide')) sh.hidden = !on;
      });
    };
    items.forEach((it) => {
      it.addEventListener('click', () => choose(it.dataset.pickItem));
      it.addEventListener('focus', () => choose(it.dataset.pickItem));
      if (root.dataset.pick === 'hover') it.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && choose(it.dataset.pickItem));
    });
  });

  // --- appointment form: post to the configured endpoint, or write the email
  $$('[data-form]').forEach((form) => {
    const note = form.querySelector('[data-form-note]');
    form.addEventListener('submit', async (e) => {
      const data = new FormData(form);
      if (form.dataset.mode === 'mail') {
        if (!form.action.startsWith('mailto:')) return;
        e.preventDefault();
        const body = [...data.entries()].filter(([, v]) => String(v).trim()).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`).join('\n');
        location.href = `${form.action}?subject=${encodeURIComponent(form.dataset.subject)}&body=${encodeURIComponent(body)}`;
        return;
      }
      e.preventDefault();
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        if (note) note.textContent = form.dataset.sent;
      } catch {
        if (note) note.textContent = form.dataset.failed;
      } finally {
        button.disabled = false;
      }
    });
  });

  // --- the name fitted to its box by measurement
  const fits = $$('[data-fit]');
  const fitAll = () => {
    fits.forEach((el) => {
      const box = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
      if (!box) return;
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      if (w) el.style.fontSize = `${Math.floor((100 * box) / w * 100) / 100}px`;
    });
  };
  if (fits.length) {
    fitAll();
    document.fonts?.ready.then(fitAll);
    addEventListener('resize', fitAll);
  }

  $$('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
})();
