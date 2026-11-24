/* One Season, brand refresh v2: restrained motion */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BOOK = 'https://ai.getbreezyapp.com/booking/one-season-heating-and-air-conditioning?utm_source=website&utm_medium=quiz';

  /* Menu sheet: full-height on phones, page behind stays put */
  const lockPage = (on) => {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.documentElement.classList.toggle('menu-open', on);
    if (on) nav.classList.remove('is-up');
    if (on) sheet.style.height = (innerHeight - nav.offsetHeight) + 'px';
    if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
  };
  const menuBtn = $('.nav__menu'), sheet = $('#sheet'), nav = $('[data-nav]');
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    sheet.hidden = open;
    lockPage(!open);
    menuBtn.querySelector('i').className = open ? 'ph-light ph-list' : 'ph-light ph-x';
    menuBtn.setAttribute('aria-label', open ? 'Menu' : 'Close menu');
    nav.classList.toggle('is-solid', !open || scrollY > 40);
  });
  /* Menu: service accordions, one open at a time */
  $$('.sacc__btn').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    $$('.sacc__btn').forEach(x => { x.setAttribute('aria-expanded', 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = true; });
    if (!open) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.getAttribute('aria-controls')).hidden = false; }
  }));
  $$('#sheet a').forEach(a => a.addEventListener('click', () => {
    sheet.hidden = true; lockPage(false); menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelector('i').className = 'ph-light ph-list'; menuBtn.setAttribute('aria-label', 'Menu');
  }));

  /* Mega menu: hover intent on mouse, click/keyboard everywhere, Esc and scrim close */
  const mmBtns = $$('[data-mm]'), mmPanels = $$('[data-panel]'), scrim = $('[data-mm-scrim]');
  let mmOpen = null, mmTimer, mmY = 0, mmAt = 0;
  const mmSet = (key) => {
    clearTimeout(mmTimer);
    if (key !== mmOpen) mmAt = Date.now();
    mmOpen = key; mmY = scrollY;
    mmBtns.forEach(b => b.setAttribute('aria-expanded', String(b.dataset.mm === key)));
    mmPanels.forEach(p => p.classList.toggle('is-open', p.dataset.panel === key));
    nav.classList.toggle('is-open', !!key);
    scrim.classList.toggle('is-on', !!key);
  };
  const mmLater = (key, ms) => { clearTimeout(mmTimer); mmTimer = setTimeout(() => mmSet(key), ms); };
  mmBtns.forEach(b => {
    // a click right after hover opened it should keep it open, not toggle it shut
    b.addEventListener('click', () => mmSet(mmOpen === b.dataset.mm && Date.now() - mmAt > 500 ? null : b.dataset.mm));
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') mmLater(b.dataset.mm, mmOpen ? 0 : 90); });
  });
  $$('.nav__item:not([data-mm]), .nav__logo, .nav__cta').forEach(el => el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && mmOpen) mmLater(null, 120); }));
  mmPanels.forEach(p => p.addEventListener('pointerenter', () => clearTimeout(mmTimer)));
  nav.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && mmOpen) mmLater(null, 220); });
  scrim.addEventListener('click', () => mmSet(null));
  $$('[data-panel] a').forEach(a => a.addEventListener('click', () => mmSet(null)));
  addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !mmOpen) return;
    const btn = mmBtns.find(b => b.dataset.mm === mmOpen); mmSet(null); btn && btn.focus();
  });
  nav.addEventListener('focusout', e => { if (mmOpen && !nav.contains(e.relatedTarget)) mmSet(null); });

  /* Nav: solid after hero top, hide on scroll down */
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    if (mmOpen && Math.abs(y - mmY) > 60) mmSet(null);
    nav.classList.toggle('is-solid', y > 40 || !sheet.hidden);
    nav.classList.toggle('is-up', y > 500 && y > lastY && sheet.hidden && !mmOpen);
    lastY = y;
    dock.classList.toggle('is-on', y > innerHeight * .9 && !nearEnd());
    $$('a', dock).forEach(a => a.tabIndex = dock.classList.contains('is-on') ? 0 : -1);
  };
  const dock = $('[data-dock]');
  const finalEl = $('.final');
  const reelEl = $('.reel');
  const nearEnd = () => {
    const r = reelEl.getBoundingClientRect();
    const inReel = r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
    return inReel || finalEl.getBoundingClientRect().top < innerHeight * .9;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* Warranty timeline: bars fill and numbers count up once it is in view */
  const wtl = $('[data-wtl]');
  if (wtl) {
    const nums = $$('[data-count]', wtl);
    if (!reduce) nums.forEach(n => { n.textContent = '0'; });
    const wio = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; wio.disconnect();
      wtl.classList.add('is-in');
      if (reduce) return;
      nums.forEach((n, k) => {
        const to = +n.dataset.count, start = performance.now() + k * 180, dur = 1300;
        const tick = (t) => {
          const p = Math.min(1, Math.max(0, (t - start) / dur));
          n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .45 });
    wio.observe(wtl);
  }

  /* Reveal on view */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 70}ms`;
    el.classList.add('is-in');
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* Season Pass billing */
  // Prices count to the new value; annual reveals the strike-through and savings line
  const passEl = $('.pass');
  const countTo = (el, to) => {
    const from = parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0;
    if (reduce || from === to) { el.textContent = '$' + to.toFixed(2); return; }
    cancelAnimationFrame(el._raf);
    const t0 = performance.now(), dur = 700;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = '$' + (from + (to - from) * e).toFixed(2);
      if (p < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  };
  $$('.bill button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.bill;
    $$('.bill button').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('[data-m]:not([data-price])').forEach(el => el.textContent = el.dataset[k]);
    $$('[data-price]').forEach(el => countTo(el, parseFloat(el.dataset[k])));
    passEl && passEl.classList.toggle('is-annual', k === 'y');
  }));

  /* Reviews arrows */
  const revs = $('[data-revs]');
  $$('[data-rev]').forEach(b => b.addEventListener('click', () => {
    const card = revs.querySelector('.rev');
    revs.scrollBy({ left: (+b.dataset.rev) * (card.offsetWidth + 16), behavior: 'smooth' });
  }));

  /* Quiz */
  const form = $('[data-quiz]');
  const qs = $$('.q', form), step = $('[data-step]'), stepName = $('[data-step-name]'), segs = $$('[data-prog] i', form);
  const NAMES = ['The problem', 'Your home', 'Your system', 'Your details', 'All set'];
  const back = $('[data-back]'), restart = $('[data-restart]');
  let i = 0;
  const show = (n) => {
    qs[i].classList.remove('is-on'); qs[n].classList.add('is-on'); i = n;
    segs.forEach((s, k) => { s.classList.toggle('is-done', k < n); s.classList.toggle('is-on', k === n); });
    step.textContent = n < 4 ? `Step ${n + 1} of 4` : 'Done';
    stepName.textContent = NAMES[n];
    back.hidden = n === 0 || n === 4; restart.hidden = n !== 4;
    if (n === 3) setTimeout(() => form.fullname.focus({ preventScroll: true }), 300);
  };
  // Keep the card the step-1 height on desktop so the photo does not jump between steps
  const qCard = form.closest('.quiz__card');
  const lockQuizHeight = () => {
    if (!qCard) return;
    if (innerWidth <= 1100) { qCard.style.minHeight = ''; return; }
    if (i !== 0) return; // only measure while step 1 is showing
    qCard.style.minHeight = '';
    qCard.style.minHeight = qCard.offsetHeight + 'px';
  };
  addEventListener('load', lockQuizHeight);
  addEventListener('resize', lockQuizHeight);
  document.fonts && document.fonts.ready.then(lockQuizHeight);
  lockQuizHeight();

  // "Something else" box is always visible: typing in it answers step 1 as "other"
  const other = $('[data-other]', form), otherRadio = $('.other__radio', other), otherNext = $('[data-other-next]', other), note = form.elements.note;
  const syncOther = () => {
    const has = note.value.trim().length > 0;
    otherNext.disabled = !has;
    if (has) otherRadio.checked = true; else if (otherRadio.checked) otherRadio.checked = false;
  };
  note.addEventListener('input', syncOther);
  form.addEventListener('change', e => {
    if (e.target.type !== 'radio' || e.target === otherRadio) return;
    const idx = qs.indexOf(e.target.closest('.q'));
    if (idx === i && i < 3) setTimeout(() => show(i + 1), 280);
  });
  const goOther = () => { if (!note.value.trim()) return; otherRadio.checked = true; show(1); };
  otherNext.addEventListener('click', goOther);
  note.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); goOther(); } });
  back.addEventListener('click', () => show(i - 1));
  restart.addEventListener('click', () => {
    form.reset(); show(0); otherNext.disabled = true;
    $$('[aria-invalid]', form).forEach(f => f.removeAttribute('aria-invalid'));
    $('[data-err]').hidden = true;
    $$('[data-dd]').forEach(dd => dd.reset && dd.reset());
  });
  // Symptom chips in the services section open the quiz with step 1 already answered
  $$('[data-issue]').forEach(btn => btn.addEventListener('click', () => {
    restart.click();
    const r = form.querySelector(`input[name="issue"][value="${btn.dataset.issue}"]`);
    if (r) { r.checked = true; show(1); }
    const book = $('#book');
    if (window.__lenis) window.__lenis.scrollTo(book, { offset: -70 }); else book.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
  /* Custom dropdown (listbox): mouse, touch and keyboard */
  $$('[data-dd]').forEach(dd => {
    const btn = $('.dd__btn', dd), list = $('.dd__list', dd), input = $('input', dd), val = btn.querySelector('span');
    const opts = $$('[role=option]', list);
    let act = 0;
    const mark = n => { act = (n + opts.length) % opts.length; opts.forEach((o, k) => o.classList.toggle('is-active', k === act)); list.setAttribute('aria-activedescendant', opts[act].id); };
    opts.forEach((o, k) => { o.id = o.id || `dd-${Math.random().toString(36).slice(2, 8)}-${k}`; });
    const isOpen = () => dd.classList.contains('is-open');
    const open = () => {
      dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      mark(Math.max(0, opts.findIndex(o => o.getAttribute('aria-selected') === 'true')));
      requestAnimationFrame(() => { if (isOpen()) list.focus({ preventScroll: true }); }); // list is still hidden this frame
    };
    const close = (focus = true) => { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); if (focus) btn.focus({ preventScroll: true }); };
    const choose = n => {
      opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === n)));
      input.value = opts[n].dataset.v; val.textContent = opts[n].dataset.v; close();
    };
    dd.reset = () => choose(0);
    btn.addEventListener('click', () => isOpen() ? close() : open());
    const onKey = e => {
      if (!isOpen()) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); } return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(act + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(act - 1); }
      else if (e.key === 'Home') { e.preventDefault(); mark(0); }
      else if (e.key === 'End') { e.preventDefault(); mark(opts.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(act); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'Tab') close(false);
    };
    btn.addEventListener('keydown', onKey);
    list.addEventListener('keydown', onKey);
    opts.forEach((o, k) => { o.addEventListener('pointerenter', () => mark(k)); o.addEventListener('click', () => choose(k)); });
    document.addEventListener('pointerdown', e => { if (!dd.contains(e.target) && dd.classList.contains('is-open')) close(false); });
  });

  const err = $('[data-err]'), send = $('.fields__send', form);
  const checks = [
    ['fullname', v => v.length > 1, 'Enter your name.'],
    ['phone', v => v.replace(/\D/g, '').length >= 10, 'Enter a 10-digit phone number.'],
    ['email', v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Check your email address.'],
    ['zip', v => /^\d{5}$/.test(v), 'Enter a 5-digit zip code.']
  ];
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid')) { e.target.removeAttribute('aria-invalid'); err.hidden = true; } });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    for (const [n, ok, msg] of checks) {
      const f = form.elements[n];
      if (!ok(f.value.trim())) { f.setAttribute('aria-invalid', 'true'); err.textContent = msg; err.hidden = false; f.focus(); return; }
    }
    err.hidden = true;
    const v = n => (form.elements[n].value || '').trim();
    const issue = v('issue'), age = v('age'), zip = v('zip');
    let visit = 'a repair visit', b = 'A technician finds the cause, explains it and gives you the exact cost before any work starts.';
    if (issue === 'new' || (age === '15' && issue !== 'tune')) {
      visit = 'a new system estimate';
      b = issue === 'new' ? 'We size the system to your home and walk you through the options in person, with no pressure.' : 'At 15+ years a repair may not be the best spend, so we can price a repair and a replacement side by side.';
    } else if (issue === 'tune') {
      visit = 'a tune-up'; b = 'Every Season Pass includes spring and fall tune-ups, from $14.95 a month, or we can book a one-off visit.';
    } else if (issue === 'noise') {
      visit = 'a diagnostic visit'; b = 'Noises and smells are worth checking early. We find the cause and explain it before anything is fixed.';
    } else if (issue === 'other') {
      visit = 'a diagnostic visit'; b = 'Your note goes to our team with your request, so we can talk it through and book the right visit.';
    }
    // Send the lead only when a destination is configured (data-endpoint on the form).
    const url = form.dataset.endpoint;
    if (url) {
      send.disabled = true; send.textContent = 'Sending…';
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ issue, home: v('home'), age, name: v('fullname'), phone: v('phone'), email: v('email'), zip, time: v('time'), sms: form.elements.sms.checked, note: v('note'), page: location.href }) });
        if (!res.ok) throw new Error(res.status);
      } catch {
        err.textContent = 'Something went wrong. Please call us at (949) 828-4910.'; err.hidden = false;
        send.disabled = false; send.textContent = 'Send my request'; return;
      }
      send.disabled = false; send.textContent = 'Send my request';
    }
    const first = v('fullname').split(/\s+/)[0];
    $('[data-r-title]').textContent = `Thanks, ${first}. We'll call you to set a time.`;
    $('[data-r-body]').textContent = `From your answers, ${visit} is the right place to start. ${b}`;
    $('[data-r-cta]').href = `${BOOK}&zip=${encodeURIComponent(zip)}`;
    show(4);
  });

  /* How it works: progress through the pinned track opens each step in turn */
  const htrack = $('[data-how]'), hsteps = $$('[data-hstep]'), himgs = $$('.how__media img'), htag = $('[data-how-tag]');
  const hbars = hsteps.map(s => s.querySelector('.hstep__bar'));
  let hcur = -1;
  const setStep = (n) => {
    if (n === hcur) return; hcur = n;
    hsteps.forEach((s, k) => s.classList.toggle('is-on', k === n));
    himgs.forEach((im, k) => im.classList.toggle('is-on', k === n));
    if (htag) htag.textContent = `0${n + 1} / 03`;
  };
  const howScroll = () => {
    if (htrack.offsetHeight <= innerHeight * 1.2) return; // stacked layout on small screens
    const r = htrack.getBoundingClientRect();
    const p = Math.max(0, Math.min(.9999, -r.top / (r.height - innerHeight)));
    const x = p * 3;
    setStep(Math.floor(x));
    hbars.forEach((b, k) => b.style.setProperty('--f', Math.max(0, Math.min(1, x - k)).toFixed(3)));
  };
  addEventListener('scroll', howScroll, { passive: true });
  howScroll();

  /* Service-area map (MapLibre, vector tiles): distance-sorted city list drives the map and the card */
  const smap = $('[data-smap]');
  if (smap) {
    const MAPS = 'https://www.google.com/maps/place/One+Season+Heating+and+Air+Conditioning/@33.65811,-117.7511805,17z/data=!3m1!4b1!4m6!3m5!1s0xa162b3ba41d5f225:0x1c4cc9748756c7a0!8m2!3d33.65811!4d-117.7511805!16s%2Fg%2F11l1m_t26v';
    const HQ = [-117.7511805, 33.65811]; // [lng, lat], from One Season's Google Maps listing
    const SITE = 'https://oneseasonair.com/service-areas/';
    // City centre points (approximate) for the cities that have their own page on oneseasonair.com
    const raw = [['Anaheim', -117.9143, 33.8366, 'anaheim'], ['Corona', -117.5664, 33.8753, 'corona'], ['Costa Mesa', -117.9187, 33.6411, 'costa-mesa'], ['Fullerton', -117.9242, 33.8704, 'fullerton'], ['Huntington Beach', -117.9988, 33.6595, 'huntington-beach'], ['Irvine', -117.8265, 33.6846, 'irvine'], ['Mission Viejo', -117.6720, 33.6000, 'mission-viejo'], ['Newport Beach', -117.9289, 33.6189, 'newport-beach'], ['Orange', -117.8531, 33.7879, 'orange'], ['Santa Ana', -117.8677, 33.7455, 'santa-ana'], ['Westminster', -117.9940, 33.7513, 'westminster']];
    const miles = ([lo1, la1], [lo2, la2]) => {
      const r = Math.PI / 180, dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
      const h = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
      return 3958.8 * 2 * Math.asin(Math.sqrt(h));
    };
    // label side per city so our own labels never collide
    const side = { 'Costa Mesa': 'l', 'Newport Beach': 'b', 'Huntington Beach': 'l', 'Westminster': 'l', 'Santa Ana': 'b', 'Fullerton': 't', 'Irvine': 't', 'Corona': 'l' };
    const cities = raw.map(([n, lo, la, slug]) => ({ n, ll: [lo, la], href: SITE + slug + '/', mi: Math.max(1, Math.round(miles(HQ, [lo, la]))), side: side[n] || 'r' }))
      .sort((x, y) => x.mi - y.mi);

    // Card
    const cEy = $('[data-s-eyebrow]', smap), cTi = $('[data-s-title]', smap), cSub = $('[data-s-sub]', smap), cCta = $('[data-s-cta]', smap), cLink = $('[data-s-link]', smap);
    const setCard = (c) => {
      const card = $('.smap__card', smap);
      card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
      if (!c) {
        cEy.textContent = 'Our office'; cTi.textContent = 'Irvine'; cSub.textContent = '7700 Irvine Center Dr #800, Irvine, CA 92618';
        cCta.textContent = 'Get directions'; cCta.href = MAPS; cCta.target = '_blank'; cLink.hidden = true;
      } else {
        cEy.textContent = 'We serve'; cTi.textContent = c.n; cSub.textContent = 'About ' + c.mi + ' miles from our Irvine office.';
        cCta.textContent = 'Book a visit'; cCta.href = '#book'; cCta.removeAttribute('target');
        cLink.hidden = false; cLink.href = c.href; cLink.firstChild.textContent = c.n + ' page ';
      }
    };
    setCard(null);
    cCta.addEventListener('click', e => { if (cCta.getAttribute('href') === '#book' && window.__lenis) { e.preventDefault(); window.__lenis.scrollTo('#book', { offset: -70 }); } });

    const mapEl = $('[data-smap-map]', smap);
    const init = () => {
      if (typeof maplibregl === 'undefined') { smap.classList.add('is-nomap'); return; }
      const wide = () => innerWidth > 1100;
      // room for the card on the left and the "One Season" label on the right
      const pad = () => wide() ? { top: 70, bottom: 70, left: 400, right: 150 } : { top: 60, bottom: 60, left: 90, right: 120 };
      const map = new maplibregl.Map({
        container: mapEl, style: 'https://tiles.openfreemap.org/styles/positron',
        center: HQ, zoom: reduce ? 10 : 12.6, attributionControl: { compact: true },
        cooperativeGestures: true, dragRotate: false, pitchWithRotate: false, touchZoomRotate: true
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      const allBounds = () => { const b = new maplibregl.LngLatBounds(HQ, HQ); cities.forEach(c => b.extend(c.ll)); return b; };

      // Route arc from the office to a city
      const arc = (p, q) => {
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1];
        const c = [mx - dy * .25, my + dx * .25], out = [];
        for (let i = 0; i <= 40; i++) { const t = i / 40; out.push([(1 - t) ** 2 * p[0] + 2 * (1 - t) * t * c[0] + t * t * q[0], (1 - t) ** 2 * p[1] + 2 * (1 - t) * t * c[1] + t * t * q[1]]); }
        return out;
      };

      // Markers (HTML, so they stay crisp and animate with CSS)
      const dots = {};
      cities.forEach((c, i) => {
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'sdot sdot--' + c.side; el.style.setProperty('--d', (i * 90) + 'ms');
        el.setAttribute('aria-label', c.n + ', about ' + c.mi + ' miles');
        el.innerHTML = '<i></i><span>' + c.n + '</span>';
        el.addEventListener('click', () => select(c.n));
        el.addEventListener('pointerenter', () => hot(c.n, true)); el.addEventListener('pointerleave', () => hot(c.n, false));
        dots[c.n] = el;
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(c.ll).addTo(map);
      });
      const hq = document.createElement('div'); hq.className = 'spin'; hq.innerHTML = '<i></i><span>One Season</span>';
      new maplibregl.Marker({ element: hq, anchor: 'center' }).setLngLat(HQ).addTo(map);

      const chips = {}; $$('.cities a').forEach(a => { chips[a.textContent.trim()] = a; });
      function hot(n, on) {
        dots[n] && dots[n].classList.toggle('is-hot', on);
        chips[n] && chips[n].classList.toggle('is-hot', on);
      }
      // Linked chips: hover lights the dot; a plain click shows the city on the map (the card links to its page)
      Object.keys(chips).forEach(n => {
        if (!dots[n]) return; const a = chips[n];
        a.addEventListener('pointerenter', () => hot(n, true)); a.addEventListener('pointerleave', () => hot(n, false));
        a.addEventListener('click', e => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let new-tab clicks through
          e.preventDefault(); select(n);
          const r = mapEl.getBoundingClientRect();
          if (r.top < 0 || r.bottom > innerHeight) (window.__lenis ? window.__lenis.scrollTo(smap, { offset: -90 }) : smap.scrollIntoView({ behavior: 'smooth' }));
        });
      });
      $('[data-s-hq]', smap).addEventListener('click', () => select('hq'));
      hq.addEventListener('click', () => select('hq'));

      let dashTimer;
      const route = (c) => {
        const src = map.getSource('route'); if (!src) return;
        src.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: c ? arc(HQ, c.ll) : [] } });
        clearInterval(dashTimer);
        if (!c || reduce) return;
        // march the dashes outward from the office
        const seq = [[0, 4, 3], [.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, .5], [3, 4, 0], [0, .5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, .5]];
        let k = 0; dashTimer = setInterval(() => { if (map.getLayer('route-dash')) map.setPaintProperty('route-dash', 'line-dasharray', seq[k = (k + 1) % seq.length]); }, 60);
      };

      function select(n) {
        const c = cities.find(x => x.n === n) || null;
        Object.entries(chips).forEach(([k, a]) => a.classList.toggle('is-on', !!c && k === c.n));
        Object.entries(dots).forEach(([k, el]) => el.classList.toggle('is-on', c && k === c.n));
        setCard(c);
        route(c);
        if (c) map.fitBounds(new maplibregl.LngLatBounds(HQ, HQ).extend(c.ll), { padding: pad(), maxZoom: 12, duration: reduce ? 0 : 1400, essential: true });
        else map.fitBounds(allBounds(), { padding: pad(), duration: reduce ? 0 : 1400 });
      }

      let ready = false;
      // Run once the style is usable: whichever of these events lands first
      const whenStyle = (fn) => {
        const go = () => { if (ready || !map.isStyleLoaded()) return; ready = true; ['styledata', 'load', 'idle'].forEach(ev => map.off(ev, go)); fn(); };
        ['styledata', 'load', 'idle'].forEach(ev => map.on(ev, go)); go();
      };
      whenStyle(() => {
        // Tone the basemap to the page palette and drop its place/road labels (we draw our own)
        const paint = (id, prop, val) => { try { if (map.getLayer(id)) map.setPaintProperty(id, prop, val); } catch (e) {} };
        paint('background', 'background-color', '#F1EDE4');
        paint('water', 'fill-color', '#D3DCE0');
        paint('park', 'fill-color', '#E4E6D6');
        paint('landuse_residential', 'fill-color', '#ECE7DC');
        paint('landcover_wood', 'fill-color', '#E2E4D3');
        paint('building', 'fill-color', '#E7E1D5');
        map.getStyle().layers.forEach(l => {
          if (/^(label_|highway-name|highway-shield|road_shield|airport|label_other)/.test(l.id)) map.setLayoutProperty(l.id, 'visibility', 'none');
        });
        map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
        map.addLayer({ id: 'route-base', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#0F1B2B', 'line-width': 3, 'line-opacity': .12 } });
        map.addLayer({ id: 'route-dash', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#0F1B2B', 'line-width': 2.5, 'line-dasharray': [0, 4, 3] } });
        // Intro: once the map is properly in view, pull back from the office to the whole area
        const io2 = new IntersectionObserver(es => {
          if (!es[0].isIntersecting) return; io2.disconnect();
          map.fitBounds(allBounds(), { padding: pad(), duration: reduce ? 0 : 2200, essential: true });
          map.once('moveend', () => smap.classList.add('is-play'));
        }, { threshold: .45 });
        io2.observe(mapEl);
      });
      addEventListener('resize', () => map.resize());
    };
    const mio = new IntersectionObserver(es => { if (es[0].isIntersecting) { mio.disconnect(); init(); } }, { rootMargin: '500px 0px' });
    mio.observe(smap);
  }

  if (reduce || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll */
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
    }));
  }

  /* Hero: quiet entrance + slow parallax */
  const heroIn = (d = 0) => {
    gsap.from('.hero__img img', { scale: 1.08, duration: 2.4, ease: 'power3.out', delay: d });
    gsap.from('.hero__h1 span', { y: 40, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: .12, delay: d + .2 });
    gsap.from('.hero__aside', { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out', delay: d + .55 });
  };

  /* Preloader: leaves once the page is ready and the logo has finished building */
  const pre = $('.pre'), root = document.documentElement;
  if (pre && root.classList.contains('is-pre')) {
    if (window.__lenis) window.__lenis.stop();
    let gone = false;
    const leave = () => {
      if (gone) return; gone = true;
      setTimeout(() => {
        heroIn(reduce ? 0 : .45);
        pre.classList.add('is-out');
        setTimeout(() => { root.classList.remove('is-pre'); if (window.__lenis) window.__lenis.start(); pre.remove(); ScrollTrigger.refresh(); }, reduce ? 320 : 1250);
      }, reduce ? 0 : 280);
    };
    const MIN = reduce ? 300 : 2100; // the logo build takes ~2s
    const ready = () => setTimeout(leave, Math.max(0, MIN - performance.now()));
    if (document.readyState === 'complete') ready(); else addEventListener('load', ready, { once: true });
    setTimeout(leave, Math.max(0, 4500 - performance.now()));
  } else {
    if (pre) pre.remove();
    heroIn();
  }
  gsap.to('.hero__img img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Jetson moment: horizontal scenes */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 821px)', () => {
    const track = $('[data-reel]');
    // measure the scenes, not scrollWidth: the drifting words are transformed past the track edge and inflate scrollWidth
    const last = track.lastElementChild;
    const dist = () => last.offsetLeft + last.offsetWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.reel', start: 'top top', end: () => `+=${dist()}`, pin: '.reel__pin', scrub: .8, invalidateOnRefresh: true }
    });
    // words drift a little slower than the cards for depth
    $$('.scene__word').forEach(w => gsap.fromTo(w, { xPercent: 18 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: w.closest('.scene'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
    // products grow into the centre and ease back out, with a slight turn
    $$('.scene__prod').forEach(p => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: p.closest('.scene'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      tl.fromTo(p, { scale: .78, rotate: -3, xPercent: 12 }, { scale: 1, rotate: 0, xPercent: 0, ease: 'power2.out', duration: 1 })
        .to(p, { scale: .84, rotate: 3, xPercent: -10, ease: 'power2.in', duration: 1 });
    });
    return () => gsap.set(track, { clearProps: 'all' });
  });

  /* Collage: photos drift at different speeds around the statement */
  mm.add('(min-width: 1101px)', () => {
    const st = { trigger: '.cluster', start: 'top 95%', end: 'center 55%', scrub: true };
    gsap.fromTo('.cl--main', { scale: .78 }, { scale: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo(['.cl--a', '.cl--b'], { xPercent: 30, yPercent: 12, opacity: .4 }, { xPercent: 0, yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo(['.cl--c', '.cl--d'], { xPercent: -30, yPercent: 12, opacity: .4 }, { xPercent: 0, yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: st });
  });
  /* Season Pass photo slow zoom */
  gsap.fromTo('.pass__hero > img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.pass__hero', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* Final image slow zoom */
  gsap.fromTo('.final__img img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* Phones and tablets: scroll-linked moments (Aira's step rail, Quilt's photo zoom, Jetson's swipe cards) */
  mm.add('(max-width: 1100px)', () => {
    const steps = $('.how__steps');
    if (reduce) { steps.style.setProperty('--p', 1); hsteps.forEach(s => s.classList.add('is-past')); return; }
    ScrollTrigger.create({ trigger: steps, start: 'top 65%', end: 'bottom 65%', scrub: true,
      onUpdate: self => steps.style.setProperty('--p', self.progress.toFixed(3)) });
    hsteps.forEach(s => ScrollTrigger.create({ trigger: s.querySelector('.hstep__row'), start: 'center 65%', toggleClass: { targets: s, className: 'is-past' } }));
    // collage photos ease out of a slight zoom as they scroll in
    $$('.cl img').forEach(img => gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom 55%', scrub: true } }));
    return () => { steps.style.removeProperty('--p'); hsteps.forEach(s => s.classList.remove('is-past')); };
  });

  ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
