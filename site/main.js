// GregWET — film w hero, wejścia sekcji, status „otwarte teraz”.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// ---------- hero: film 3 s, zatrzymanie na ostatniej klatce, potem karta z treścią ----------
(() => {
  const video = document.querySelector('[data-hero-video]');
  let arrived = false;
  const arrive = () => {
    if (arrived) return;
    arrived = true;
    root.classList.add('arrived');
  };
  const showStill = () => {
    if (video) video.hidden = true;
    arrive();
  };

  if (!video || reduceMotion) { showStill(); return; }

  // lżejsza wersja na telefony
  if (window.matchMedia('(max-width: 48em)').matches) {
    video.querySelector('source').src = '/media/hero-720.mp4';
    video.load();
  }

  video.addEventListener('ended', arrive, { once: true });
  video.addEventListener('error', showStill, { once: true });

  // jeśli film nie ruszy (oszczędzanie energii, wolne łącze), karta i tak się pokaże
  const fallback = setTimeout(() => { if (video.paused || video.readyState < 2) showStill(); else arrive(); }, 7000);
  video.addEventListener('ended', () => clearTimeout(fallback), { once: true });

  const attempt = video.play();
  if (attempt && attempt.catch) attempt.catch(() => { clearTimeout(fallback); showStill(); });
})();

// ---------- wejścia sekcji, raz; elementy w siatkach wchodzą po kolei ----------
(() => {
  document.querySelectorAll('.areas, .reviews, .team, .strip, .facts__grid').forEach((grid) => {
    [...grid.querySelectorAll('[data-reveal]')].forEach((el, i) => el.style.setProperty('--d', i % 4));
  });
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
})();

// ---------- menu na telefonie ----------
(() => {
  const burger = document.querySelector('[data-burger]');
  const menu = document.getElementById('menu-mobile');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  });
})();

// ---------- galeria: powiększenie zdjęcia ----------
(() => {
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (!dialog || !dialog.showModal) return;
  const img = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  document.querySelectorAll('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const thumb = link.querySelector('img');
      img.src = link.href;
      img.alt = thumb.alt;
      caption.textContent = thumb.alt;
      dialog.showModal();
    });
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
})();

// ---------- opinie: długie teksty zwinięte, przycisk „Czytaj całość” ----------
(() => {
  document.querySelectorAll('[data-clamp]').forEach((box) => {
    const button = box.parentElement.querySelector('.review__more');
    box.classList.add('is-clamped');
    if (box.scrollHeight <= box.clientHeight + 2) { box.classList.remove('is-clamped'); return; }
    button.hidden = false;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const open = box.classList.toggle('is-clamped') === false;
      button.textContent = open ? 'Zwiń' : 'Czytaj całość';
      button.setAttribute('aria-expanded', String(open));
    });
  });
})();

// ---------- karuzela opinii: strzałki, licznik, przewijanie palcem ----------
(() => {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-track]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const count = root.querySelector('[data-count]');
    const cards = [...track.children];
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const update = () => {
      const first = Math.round(track.scrollLeft / step());
      const visible = Math.max(1, Math.round(track.clientWidth / step()));
      const last = Math.min(cards.length, first + visible);
      count.textContent = visible > 1 ? `${first + 1}–${last} / ${cards.length}` : `${first + 1} / ${cards.length}`;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    let t;
    track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();

// ---------- status: czy teraz otwarte (czas krakowski) ----------
(() => {
  const short = document.querySelector('[data-status]');
  const long = document.querySelector('[data-status-long]');
  const dots = document.querySelectorAll('.topbar__status .dot, [data-status-dot]');
  const hours = document.querySelectorAll('[data-hours] li');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const OPEN = 8;
  const closeAt = (day) => (day === 0 ? 20 : 22);

  const now = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return { day: days.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  };

  const update = () => {
    const { day, minutes } = now();
    const close = closeAt(day);
    const isOpen = minutes >= OPEN * 60 && minutes < close * 60;
    let s;
    let l;
    if (isOpen) {
      s = `${day === 0 ? 'Dziś dyżur' : 'Otwarte teraz'} · do ${close}:00`;
      l = `${day === 0 ? 'Dziś dyżur' : 'Otwarte teraz'}, zapraszamy do ${close}:00`;
    } else if (minutes < OPEN * 60) {
      s = 'Zamknięte · otwieramy dziś o 8:00';
      l = 'Teraz zamknięte, otwieramy dziś o 8:00';
    } else {
      s = 'Zamknięte · otwieramy jutro o 8:00';
      l = 'Teraz zamknięte, otwieramy jutro o 8:00';
    }
    if (short) short.textContent = s;
    if (long) long.textContent = l;
    dots.forEach((d) => d.classList.toggle('is-open', isOpen));
    hours.forEach((li) => li.classList.toggle('is-today', li.dataset.days.split(',').map(Number).includes(day)));
  };

  update();
  setInterval(update, 30000);
})();
