// Generator strony GregWET: wspólny szablon + treść → site/**/index.html (te same adresy co stara strona).
// Użycie: node src/build.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const SITE = 'https://weterynarz.krakow.pl';
const BOOK = 'https://rezerwacja.weterynarz.krakow.pl/';
const MAPS = 'https://maps.app.goo.gl/ugwTqxsdB6rPjZG38';

const content = async (slug) => JSON.parse(await readFile(join(root, 'src', 'content', slug.replace(/\//g, '__') + '.json'), 'utf8'));

// stary adres → nowy (tytuły, opisy i treść przeniesione ze starej strony)
const fixAddress = (s = '') => s
  .replace(/\|?\s*GregWET Forteczna 51/g, '| GregWET Kraków, ul. Pronaszków 2')
  .replace(/na ul\. Fortecznej 51/g, 'przy ul. Pronaszków 2')
  .replace(/na ul\. Fortecznej 51|ul\. Fortecznej 51/g, 'ul. Pronaszków 2')
  .replace(/ul\. Forteczna 51/g, 'ul. Pronaszków 2');

// ---------- usługi ----------
const SERVICES = [
  { slug: 'profilaktyka', name: 'Profilaktyka', icon: 'profilaktyka', area: 'Profilaktyka i leczenie', short: 'Szczepienia, odrobaczanie i regularne przeglądy zdrowia psów, kotów i gryzoni.' },
  { slug: 'kardiologia', name: 'Kardiologia', icon: 'kardiologia', area: 'Profilaktyka i leczenie', short: 'Badanie serca i opieka nad pacjentami z chorobami krążenia.' },
  { slug: 'dermatologia', name: 'Dermatologia', icon: 'dermatologia', area: 'Profilaktyka i leczenie', short: 'Problemy skóry, sierści i uszu, alergie i uporczywy świąd.' },
  { slug: 'okulistyka', name: 'Okulistyka weterynaryjna', icon: 'okulistyka', area: 'Profilaktyka i leczenie', short: 'Badanie oczu i leczenie chorób narządu wzroku.' },
  { slug: 'medycyna-regeneracyjna', name: 'Medycyna regeneracyjna', icon: 'regeneracja', area: 'Profilaktyka i leczenie', short: 'Terapie wspierające gojenie tkanek i leczenie stawów.' },
  { slug: 'chirurgia', name: 'Chirurgia', icon: 'chirurgia', area: 'Chirurgia i stany nagłe', short: 'Zabiegi planowe i pilne, od kastracji po operacje tkanek miękkich.' },
  { slug: 'ortopedia', name: 'Ortopedia', icon: 'ortopedia', area: 'Chirurgia i stany nagłe', short: 'Leczenie urazów i chorób kości, stawów oraz więzadeł.' },
  { slug: 'bank-krwi', name: 'Bank krwi', icon: 'bank-krwi', area: 'Chirurgia i stany nagłe', short: 'Filia banku krwi: krew do transfuzji i oznaczanie grup krwi.' },
  { slug: 'badania-laboratoryjne', name: 'Badania laboratoryjne', icon: 'badania', area: 'Diagnostyka na miejscu', short: 'Badania krwi, moczu i kału oraz cytologia.' },
  { slug: 'badania-radiologiczne', name: 'Badania radiologiczne', icon: 'radiologia', area: 'Diagnostyka na miejscu', short: 'Zdjęcia RTG opisywane przez lekarza specjalistę radiologa.' },
  { slug: 'badania-ultrasonograficzne', name: 'Badania ultrasonograficzne', icon: 'ultrasonograf', area: 'Diagnostyka na miejscu', short: 'Badania USG jamy brzusznej i serca.' },
  { slug: 'endoskopia-zwierzat-krakow', name: 'Endoskopia', icon: 'endoskopia', area: 'Diagnostyka na miejscu', short: 'Małoinwazyjne badanie przewodu pokarmowego i dróg oddechowych.' },
];
const AREAS = [
  { name: 'Profilaktyka i leczenie', photo: '/img/kot.webp', alt: 'Lekarka osłuchuje czarnego kota' },
  { name: 'Chirurgia i stany nagłe', photo: '/img/zabieg-1.webp', alt: 'Dwoje lekarzy podczas operacji' },
  { name: 'Diagnostyka na miejscu', photo: '/img/mikroskop.webp', alt: 'Mikroskop w laboratorium lecznicy' },
];

const TEAM = [
  ['lek. wet. Aleksandra Gregoraszczuk', 'Specjalista rozrodu, anestezjolog', '/img/aleksandra.webp'],
  ['lek. wet. Bartłomiej Gregoraszczuk', 'Specjalista chirurg, specjalista radiolog', '/img/bartlomiej.webp'],
  ['lek. wet. Gabriela Pacyna', 'Interna'],
  ['lek. wet. Kamila Paruch', 'Interna, nefrologia'],
  ['lek. wet. Witek Moroz', 'Stomatologia'],
  ['lek. wet. Ewa Przepiórska', 'Lekarz weterynarii'],
  ['lek. wet. Gabriela Zapała', 'Lekarz weterynarii'],
  ['Justyna Natkaniec-Chuchva', 'mgr technik weterynarii'],
  ['Karolina Myśliwiec-Lachman', 'Technik weterynarii'],
  ['Bogdan Subora', 'Asystent lekarza'],
  ['Maja Połatyńska', 'Asystentka lekarza'],
  ['Natalia Józefczyk', 'Recepcja'],
  ['Oliwia Czarnecka', 'Recepcja'],
];
const initials = (name) => name.replace(/^(lek\. wet\.)\s*/, '').split(/[\s-]+/).slice(0, 2).map((w) => w[0]).join('');
const teamList = () => `<ul class="team">${TEAM.map(([n, r, img]) => `
        <li class="person" data-reveal>${img ? `<img src="${img}" alt="" width="400" height="500" loading="lazy">` : `<span class="avatar" aria-hidden="true">${initials(n)}</span>`}<strong>${n}</strong><span>${r}</span></li>`).join('')}
      </ul>`;

// ---------- szablon ----------
const NAV = [
  ['/oferta/', 'Oferta'], ['/o-nas/', 'O nas'], ['/personel/', 'Zespół'], ['/galeria/', 'Galeria'], ['/porady/', 'Porady'], ['/kontakt/', 'Kontakt'],
];

function layout({ path, title, description, body, home = false, extraHead = '' }) {
  const nav = NAV.map(([href, label]) => {
    const current = path === href || (href !== '/' && path.startsWith(href));
    return `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('\n      ');
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}/img/budynek.webp">
<meta property="og:locale" content="pl_PL">
<meta name="theme-color" content="#1c2530">
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${extraHead}</head>
<body${home ? '' : ' class="sub"'}>

<div class="topbar">
  <div class="container topbar__inner">
    <p class="topbar__status"><span class="dot" aria-hidden="true"></span><span data-status>Pn–Sb 8:00–22:00, Nd 8:00–20:00</span></p>
    <p class="topbar__info">
      <a href="/ostry-dyzur/">Ostry dyżur</a>
      <a href="${MAPS}">ul. Pronaszków 2, Kraków</a>
      <a href="tel:+48501224121">+48 501 224 121</a>
    </p>
  </div>
</div>

<header class="header">
  <div class="container header__inner">
    <a class="header__logo" href="/" aria-label="GregWET – strona główna">
      <img src="/img/GREGWET_logo_2025.webp" alt="GregWET" width="1137" height="271">
    </a>
    <nav class="header__nav" aria-label="Główna">
      ${nav}
    </nav>
    <div class="header__cta">
      <a class="btn btn--ghost header__phone" href="tel:+48501224121">Zadzwoń</a>
      <a class="btn btn--primary" href="${BOOK}">Umów wizytę</a>
    </div>
    <button class="header__burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu-mobile" data-burger><span></span><span></span></button>
  </div>
  <nav class="menu-mobile" id="menu-mobile" aria-label="Menu" hidden>
    <div class="container">
      ${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n      ')}
      <a href="/ostry-dyzur/">Ostry dyżur</a>
    </div>
  </nav>
</header>

<main>
${body}
</main>

<footer class="footer">
  <div class="container footer__grid">
    <div>
      <img class="footer__logo" src="/img/GREGWET_logo_2025_W.webp" alt="GregWET" width="1137" height="370" loading="lazy">
      <p>Rodzinna lecznica weterynaryjna w Krakowie. Od 2002 roku. Przyjmujemy pacjentów z całego Krakowa, m.in. z Łagiewnik, Dębnik, Klinów i Swoszowic.</p>
      <p class="footer__social"><a href="https://www.facebook.com/Gregwetprzychodniaweterynaryjna">Facebook</a> · <a href="https://www.instagram.com/greg.wet/">Instagram</a></p>
    </div>
    <div>
      <h3>Lecznica</h3>
      <ul class="footer__links">
        <li><a href="/o-nas/">O nas</a></li>
        <li><a href="/personel/">Zespół</a></li>
        <li><a href="/galeria/">Galeria</a></li>
        <li><a href="/porady/">Porady</a></li>
        <li><a href="/kontakt/">Kontakt</a></li>
      </ul>
    </div>
    <div>
      <h3>Oferta</h3>
      <ul class="footer__links">
        <li><a href="/oferta/">Wszystkie usługi</a></li>
        <li><a href="/ostry-dyzur/">Ostry dyżur</a></li>
        <li><a href="/oferta/chirurgia/">Chirurgia</a></li>
        <li><a href="/oferta/profilaktyka/">Profilaktyka</a></li>
        <li><a href="/uslugi-dodatkowe/">Usługi dodatkowe</a></li>
      </ul>
    </div>
    <div>
      <h3>Godziny i adres</h3>
      <p>Pn–Sb 8:00–22:00<br>Nd i święta 8:00–20:00 (dyżur)</p>
      <p>ul. Zbigniewa i Andrzeja Pronaszków 2<br>30-437 Kraków</p>
    </div>
  </div>
  <div class="container footer__legal">
    <p>© 2026 GregWET. Wszelkie prawa zastrzeżone. Strona używa plików cookies.</p>
    <a href="/polityka-prywatnosci/">Polityka prywatności</a>
  </div>
</footer>

<div class="mobilebar">
  <a class="btn btn--dark" href="tel:+48501224121">Zadzwoń</a>
  <a class="btn btn--primary" href="${BOOK}">Umów wizytę</a>
</div>

<script src="/main.js" defer></script>
</body>
</html>
`;
}

const pagehead = ({ crumbs, h1, lead }) => `
  <section class="pagehead">
    <div class="container">
      <nav class="crumbs" aria-label="Okruszki"><a href="/">Strona główna</a>${crumbs.map(([href, label]) => href ? ` <span aria-hidden="true">/</span> <a href="${href}">${label}</a>` : ` <span aria-hidden="true">/</span> <span aria-current="page">${label}</span>`).join('')}</nav>
      <h1>${h1}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>
  </section>`;

const bookCard = (extra = '') => `
      <div class="aside__card aside__card--book">
        <h2>Umów wizytę</h2>
        <p class="aside__status"><span class="dot" aria-hidden="true" data-status-dot></span><span data-status-long>Pn–Sb 8:00–22:00, Nd 8:00–20:00</span></p>
        <a class="btn btn--primary" href="${BOOK}">Rezerwacja online</a>
        <a class="btn btn--dark" href="tel:+48501224121">+48 501 224 121</a>
        <ul class="hours hours--small" data-hours>
          <li data-days="1,2,3,4,5,6"><span>Pn – Sb</span><span>8:00 – 22:00</span></li>
          <li data-days="0"><span>Nd i święta</span><span>8:00 – 20:00</span></li>
        </ul>
        <p class="aside__addr">ul. Zbigniewa i Andrzeja Pronaszków 2, 30-437 Kraków</p>
      </div>${extra}`;

const servicesAside = (current) => `
      <div class="aside__card">
        <h2>Inne usługi</h2>
        <ul class="aside__links">
          ${SERVICES.filter((s) => s.slug !== current).map((s) => `<li><a href="/oferta/${s.slug}/">${s.name}</a></li>`).join('\n          ')}
        </ul>
        <a class="link-arrow" href="/oferta/">Cała oferta</a>
      </div>`;

const ctaBand = `
  <section class="cta">
    <div class="container cta__inner" data-reveal>
      <div>
        <h2>Umów wizytę w GregWET</h2>
        <p>Zarezerwuj termin online albo zadzwoń. W niedziele i święta przyjmujemy w trybie dyżurowym.</p>
      </div>
      <div class="cta__actions">
        <a class="btn btn--dark btn--lg" href="${BOOK}">Rezerwacja online</a>
        <a class="btn btn--white btn--lg" href="tel:+48501224121">+48 501 224 121</a>
      </div>
    </div>
  </section>`;

// treść ze starej strony: zdejmij pierwszy nagłówek, jeśli powtarza H1
const stripFirstHeading = (html, h1) => html.replace(/^\s*<h2>([\s\S]*?)<\/h2>/, (m, t) => (t.replace(/<[^>]+>/g, '').trim().toLowerCase().startsWith(h1.toLowerCase().slice(0, 8)) ? '' : m));
// zdjęcia stojące obok siebie → jedna galeria
const groupImages = (html) => html.replace(/((?:\s*<img [^>]+>\s*){2,})/g, (m) => `\n<div class="prose__gallery">${m.trim()}</div>\n`);

const proseLayout = ({ html, aside }) => `
  <section class="section section--page">
    <div class="container page">
      <article class="prose" data-reveal>
${groupImages(html)}
      </article>
      <aside class="aside">${aside}
      </aside>
    </div>
  </section>`;

const pages = [];
const add = (path, title, description, body, opts = {}) => pages.push({ path, title, description, body, ...opts });

// ---------- strona główna ----------
{
  // karuzela opinii z src/content/opinie.json (kolejność w pliku = kolejność na stronie)
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const reviews = JSON.parse(await readFile(join(root, 'src', 'content', 'opinie.json'), 'utf8'));
  const carousel = `      <div class="carousel" data-carousel data-reveal>
        <div class="carousel__track" tabindex="0" role="region" aria-label="Opinie klientów z Google" data-track>${reviews.map((r) => `
          <figure class="review">
            <p class="stars" aria-label="${r.stars} na 5 gwiazdek">${'★'.repeat(r.stars)}</p>
            <blockquote class="review__text" data-clamp>
              ${r.text.map((t) => `<p>${esc(t)}</p>`).join('\n              ')}
            </blockquote>
            <button class="review__more" type="button" hidden>Czytaj całość</button>
            <figcaption><span class="avatar" aria-hidden="true">${initials(r.name)}</span><span><strong>${esc(r.name)}</strong><span>${r.when}</span></span></figcaption>
          </figure>`).join('')}
        </div>
        <div class="carousel__nav">
          <button class="carousel__btn" type="button" data-prev aria-label="Poprzednie opinie">←</button>
          <span class="carousel__count" data-count aria-live="polite">1 / ${reviews.length}</span>
          <button class="carousel__btn" type="button" data-next aria-label="Następne opinie">→</button>
        </div>
      </div>`;
  const home = (await readFile(join(root, 'src', 'pages', 'home.html'), 'utf8')).replace('{{OPINIE}}', carousel);
  const ld = `<link rel="preload" as="image" href="/media/hero-first.jpg">
<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'VeterinaryCare', name: 'Lecznica weterynaryjna GregWET', url: `${SITE}/`,
    telephone: '+48501224121', email: 'gregwetwyniki@gmail.com', foundingDate: '2002', image: `${SITE}/img/budynek.webp`,
    address: { '@type': 'PostalAddress', streetAddress: 'ul. Zbigniewa i Andrzeja Pronaszków 2', postalCode: '30-437', addressLocality: 'Kraków', addressCountry: 'PL' },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '22:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '08:00', closes: '20:00' },
    ],
    sameAs: ['https://www.facebook.com/Gregwetprzychodniaweterynaryjna', 'https://www.instagram.com/greg.wet/'],
  }, null, 2)}
</script>
`;
  add('/', 'Weterynarz Kraków – Lecznica GregWET | ul. Pronaszków 2, otwarte 7 dni w tygodniu',
    'Rodzinna lecznica weterynaryjna GregWET w Krakowie. Psy, koty i gryzonie od 2002 roku. Chirurgia, ortopedia, kardiologia, diagnostyka, bank krwi, stany nagłe. Otwarte 7 dni w tygodniu, ul. Pronaszków 2.',
    home, { home: true, extraHead: ld });
}

// ---------- oferta ----------
{
  const c = await content('oferta');
  const body = pagehead({ crumbs: [[null, 'Oferta']], h1: 'Nasza oferta', lead: 'Dwanaście dziedzin medycyny weterynaryjnej pod jednym dachem. Leczymy, operujemy i diagnozujemy na miejscu, przy ul. Pronaszków 2.' }) + `
  <section class="section section--page">
    <div class="container">
      ${AREAS.map((a) => `
      <div class="svc-area" data-reveal>
        <div class="svc-area__head">
          <img class="rounded" src="${a.photo}" alt="${a.alt}" loading="lazy">
          <h2>${a.name}</h2>
        </div>
        <ul class="svc-list">
          ${SERVICES.filter((s) => s.area === a.name).map((s) => `
          <li><a class="svc" href="/oferta/${s.slug}/">
            <img src="/img/ikony/${s.icon}.webp" alt="" width="64" height="64" loading="lazy">
            <span><strong>${s.name}</strong><span>${s.short}</span></span>
          </a></li>`).join('')}
        </ul>
      </div>`).join('')}
      <div class="svc-extra" data-reveal>
        <a class="svc-extra__item" href="/ostry-dyzur/"><strong>Ostry dyżur</strong><span>Stany nagłe, transfuzje krwi i osocza, leczenie szpitalne. Co robić w nagłym wypadku.</span></a>
        <a class="svc-extra__item" href="/uslugi-dodatkowe/"><strong>Usługi dodatkowe</strong><span>Pakiety PetHELP i ubezpieczenie zwierząt Generali.</span></a>
      </div>
    </div>
  </section>` + ctaBand;
  add('/oferta/', c.title, c.description || 'Oferta lecznicy weterynaryjnej GregWET w Krakowie: chirurgia, ortopedia, kardiologia, okulistyka, dermatologia, diagnostyka laboratoryjna i obrazowa, endoskopia, bank krwi.', body);
}

// ---------- podstrony usług ----------
for (const s of SERVICES) {
  const c = await content(`oferta/${s.slug}`);
  const html = stripFirstHeading(fixAddress(c.html), s.name);
  const body = pagehead({ crumbs: [['/oferta/', 'Oferta'], [null, s.name]], h1: s.name, lead: s.short }) +
    proseLayout({ html, aside: bookCard(servicesAside(s.slug)) }) + ctaBand;
  add(`/oferta/${s.slug}/`, fixAddress(c.title), fixAddress(c.description) || `${s.name} – ${s.short} Lecznica weterynaryjna GregWET, Kraków, ul. Pronaszków 2.`, body);
}

// ---------- strony z treścią ----------
const simple = [
  ['ostry-dyzur', 'Ostry dyżur', 'Przyjmujemy pacjentów w stanach nagłych, wykonujemy transfuzje krwi i osocza oraz prowadzimy leczenie szpitalne.'],
  ['uslugi-dodatkowe', 'Usługi dodatkowe', 'Pakiety weterynaryjne PetHELP i ubezpieczenie kosztów leczenia psa Generali.'],
  ['polityka-prywatnosci', 'Polityka prywatności', ''],
];
for (const [slug, h1, lead] of simple) {
  const c = await content(slug);
  let html = stripFirstHeading(fixAddress(c.html), h1);
  // lista fraz kluczowych ze starej strony usług dodatkowych (keyword stuffing) – usunięta
  if (slug === 'uslugi-dodatkowe') html = html.replace(/(<p>\s*)?dobry weterynarz kraków[\s\S]*?weterynarz swoszowice kraków(\s*<\/p>)?/i, '');
  const body = pagehead({ crumbs: [[null, h1]], h1, lead }) + proseLayout({ html, aside: bookCard() });
  add(`/${slug}/`, fixAddress(c.title), fixAddress(c.description) || `${h1} – lecznica weterynaryjna GregWET w Krakowie, ul. Pronaszków 2.`, body);
}

// ---------- o nas ----------
{
  const c = await content('o-nas');
  const html = c.html.replace(/<img [^>]+>/g, '');
  const body = pagehead({ crumbs: [[null, 'O nas']], h1: 'O nas', lead: 'Rodzinna lecznica weterynaryjna w Krakowie, założona przez Aleksandrę i Bartłomieja Gregoraszczuk.' }) + `
  <section class="section section--page">
    <div class="container page">
      <article class="prose" data-reveal>
        <img class="prose__lead-img" src="/img/zalozyciele.webp" alt="Aleksandra i Bartłomiej Gregoraszczuk" width="960" height="1200">
${html}
      </article>
      <aside class="aside">${bookCard()}
      </aside>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="section__bar section__bar--small" data-reveal>
        <h2>Nasz zespół</h2>
        <a class="link-arrow" href="/personel/">Poznaj zespół</a>
      </div>
      ${teamList()}
    </div>
  </section>` + ctaBand;
  add('/o-nas/', c.title, c.description || 'Lecznica GregWET to rodzinna praktyka weterynaryjna założona w 2002 roku przez Aleksandrę i Bartłomieja Gregoraszczuk. Kraków, ul. Pronaszków 2.', body);
}

// ---------- zespół ----------
{
  const c = await content('personel');
  const body = pagehead({ crumbs: [[null, 'Zespół']], h1: 'Nasz zespół', lead: 'Lekarze weterynarii, technicy, asystenci i recepcja. 13 osób, które zajmą się Twoim zwierzakiem.' }) + `
  <section class="section section--page">
    <div class="container">
      <div class="founders" data-reveal>
        <img class="rounded founders__photo" src="/img/zalozyciele.webp" alt="Aleksandra i Bartłomiej Gregoraszczuk" width="960" height="1200" loading="lazy">
        <div class="founders__text">
          <p class="pill">Założyciele lecznicy</p>
          <h2>Aleksandra i Bartłomiej Gregoraszczuk</h2>
          <p>Po studiach w Lublinie, w 2002 roku, otworzyli pierwszy gabinet w Krakowie. Dr Aleksandra specjalizuje się w anestezjologii i kardiologii weterynaryjnej, dr Bartłomiej w chirurgii, ortopedii i diagnostyce obrazowej.</p>
          <a class="link-arrow" href="/o-nas/">Nasza historia</a>
        </div>
      </div>
      ${teamList()}
    </div>
  </section>` + ctaBand;
  add('/personel/', c.title, c.description || 'Zespół lecznicy weterynaryjnej GregWET w Krakowie: lekarze weterynarii, technicy, asystenci i recepcja.', body);
}

// ---------- kontakt ----------
{
  const c = await content('kontakt');
  const body = pagehead({ crumbs: [[null, 'Kontakt']], h1: 'Kontakt', lead: 'Od 4 maja 2026 lecznica działa w nowej lokalizacji: ul. Zbigniewa i Andrzeja Pronaszków 2, 30-437 Kraków.' }) + `
  <section class="section section--page">
    <div class="container contact">
      <div class="contact__card" data-reveal>
        <h2>Lecznica GregWET</h2>
        <dl class="contact__list">
          <div><dt>Adres</dt><dd>ul. Zbigniewa i Andrzeja Pronaszków 2<br>30-437 Kraków</dd></div>
          <div><dt>Telefon</dt><dd><a href="tel:+48501224121">+48 501 224 121</a><br><a href="tel:+48122622486">+48 12 262 24 86</a></dd></div>
          <div><dt>Klienci</dt><dd><a href="mailto:gregwetwyniki@gmail.com">gregwetwyniki@gmail.com</a></dd></div>
          <div><dt>Firmy</dt><dd><a href="mailto:greg@weterynarz.krakow.pl">greg@weterynarz.krakow.pl</a><br><span class="muted">urzędy, firmy, przedstawiciele, dostawcy</span></dd></div>
        </dl>
        <ul class="hours" data-hours>
          <li data-days="1,2,3,4,5,6"><span>Poniedziałek – sobota</span><span>8:00 – 22:00</span></li>
          <li data-days="0"><span>Niedziela i święta (dyżur)</span><span>8:00 – 20:00</span></li>
        </ul>
        <div class="contact__actions">
          <a class="btn btn--primary" href="${BOOK}">Umów wizytę online</a>
          <a class="btn btn--outline" href="${MAPS}">Otwórz w Mapach Google</a>
        </div>
      </div>
      <div class="contact__map" data-reveal>
        <iframe title="Mapa dojazdu do lecznicy GregWET" src="https://www.google.com/maps?q=ul.+Zbigniewa+i+Andrzeja+Pronaszk%C3%B3w+2,+30-437+Krak%C3%B3w&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
    <div class="container strip">
      <figure data-reveal><img class="rounded" src="/img/budynek.webp" alt="Budynek lecznicy od strony ulicy" width="1600" height="1000" loading="lazy"><figcaption>Budynek od strony ulicy</figcaption></figure>
      <figure data-reveal><img class="rounded" src="/img/wejscie.webp" alt="Wejście do lecznicy" width="864" height="1080" loading="lazy"><figcaption>Wejście prosto z chodnika</figcaption></figure>
      <figure data-reveal><img class="rounded" src="/media/hero-last.webp" alt="Recepcja lecznicy" width="1920" height="1080" loading="lazy"><figcaption>Recepcja</figcaption></figure>
    </div>
  </section>`;
  add('/kontakt/', c.title, c.description || 'Kontakt z lecznicą weterynaryjną GregWET: ul. Pronaszków 2, Kraków. Tel. +48 501 224 121. Otwarte 7 dni w tygodniu.', body);
}

// ---------- galeria ----------
{
  const c = await content('galeria');
  const NEW = [
    ['/img/budynek.webp', 'Budynek lecznicy przy ul. Pronaszków 2'], ['/img/wejscie.webp', 'Wejście od ulicy'],
    ['/img/drzwi-godziny.webp', 'Drzwi z godzinami otwarcia'], ['/img/korytarz.webp', 'Korytarz i poczekalnia'],
    ['/media/hero-last.webp', 'Recepcja'],
  ];
  const WORK = [
    ['/img/zabieg-1.webp', 'Operacja w dwuosobowym zespole'], ['/img/zabieg-2.webp', 'Chirurg i anestezjolog przy stole'],
    ['/img/przygotowanie.webp', 'Przygotowanie pacjenta do zabiegu'], ['/img/przygotowanie-2.webp', 'Przygotowanie narzędzi'],
    ['/img/sala.webp', 'Jałowe pakiety na stole zabiegowym'], ['/img/kot.webp', 'Badanie kota'],
    ['/img/mikroskop.webp', 'Laboratorium'], ['/img/pies.webp', 'Pacjent w boksie szpitalnym'],
  ];
  const grid = (items) => `<ul class="gallery-grid">${items.map(([src, alt]) => `
        <li data-reveal><a href="${src}" data-lightbox><img src="${src}" alt="${alt}" loading="lazy"><span>${alt}</span></a></li>`).join('')}
      </ul>`;
  const body = pagehead({ crumbs: [[null, 'Galeria']], h1: 'Galeria', lead: 'Nowa lecznica przy ul. Pronaszków 2 i codzienna praca naszego zespołu.' }) + `
  <section class="section section--page">
    <div class="container">
      <h2 class="gallery-title" data-reveal>Nowa lecznica</h2>
      ${grid(NEW)}
      <h2 class="gallery-title" data-reveal>Z pracy naszego zespołu</h2>
      ${grid(WORK)}
    </div>
  </section>
  <dialog class="lightbox" data-lightbox-dialog><form method="dialog"><button class="lightbox__close" aria-label="Zamknij">×</button></form><img alt=""><p></p></dialog>` + ctaBand;
  add('/galeria/', c.title, c.description || 'Galeria lecznicy weterynaryjnej GregWET w Krakowie: nowy budynek przy ul. Pronaszków 2, sala zabiegowa i praca zespołu.', body);
}

// ---------- porady + wpisy ----------
const POSTS = ['opieka-nad-czworonogiem-w-sylwestra', 'upaly-zasady-prawidlowej-opieki', 'syndrom-zespol-okna-uchylnego', 'odrobaczanie',
  'kastracja-i-sterylizacja-mity-a-fakty', 'nowe-zwierze-w-domu', 'badanie-moczu', 'badania-krwi'];
{
  const list = await content('porady');
  // okładki i zajawki z listy na starej stronie
  const covers = {};
  for (const m of list.html.matchAll(/<a href="\/([^"/]+)\/">\s*<img src="([^"]+)"[\s\S]*?<\/h2>\s*<p>[^<]*(?:<a[^>]*>[^<]*<\/a>)?[^<]*\|\s*([^|<]+?)\s*\|[\s\S]*?<\/p>([^<]*)/g)) {
    covers[m[1]] = { img: m[2], date: m[3].trim(), excerpt: m[4].trim() };
  }
  const posts = [];
  for (const slug of POSTS) {
    const c = await content(slug);
    const meta = { ...(covers[slug] || {}) };
    if (c.cover) meta.img = c.cover;
    const text = c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const excerpt = meta.excerpt || text.slice(0, 180).replace(/\s\S*$/, '') + '…';
    const date = c.date ? new Date(c.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : meta.date || '';
    posts.push({ slug, h1: c.h1, img: meta.img, excerpt, date });
    // okładka jest nad treścią, więc ten sam obrazek w treści byłby powtórzony
    const html = meta.img ? c.html.split(`<img src="${meta.img}"`).join('<img hidden src="' + meta.img + '"').replace(/<img hidden [^>]*>/, '') : c.html;
    const body = pagehead({ crumbs: [['/porady/', 'Porady'], [null, c.h1]], h1: c.h1, lead: date ? `Opublikowano ${date}` : '' }) + `
  <section class="section section--page">
    <div class="container page">
      <article class="prose" data-reveal>
        ${meta.img ? `<img class="prose__lead-img prose__lead-img--wide" src="${meta.img}" alt="${c.h1}">` : ''}
${groupImages(html)}
        <p class="prose__back"><a class="link-arrow" href="/porady/">Wszystkie porady</a></p>
      </article>
      <aside class="aside">${bookCard()}
      </aside>
    </div>
  </section>`;
    add(`/${slug}/`, c.title, c.description || excerpt, body);
  }
  const body = pagehead({ crumbs: [[null, 'Porady']], h1: 'Porady', lead: 'Praktyczne wskazówki naszych lekarzy: profilaktyka, badania i codzienna opieka nad psem i kotem.' }) + `
  <section class="section section--page">
    <div class="container">
      <ul class="posts">${posts.map((p) => `
        <li data-reveal><a class="post-card" href="/${p.slug}/">
          ${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : '<span class="post-card__ph" aria-hidden="true"></span>'}
          <span class="post-card__body"><span class="post-card__date">${p.date}</span><strong>${p.h1}</strong><span>${p.excerpt}</span></span>
        </a></li>`).join('')}
      </ul>
    </div>
  </section>` + ctaBand;
  add('/porady/', list.title.replace(/\s+/g, ' '), list.description || 'Porady weterynaryjne lecznicy GregWET: odrobaczanie, badania krwi i moczu, kastracja, opieka w upały i w sylwestra.', body);
}

// ---------- zapis ----------
for (const p of pages) {
  const dir = join(out, p.path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), layout(p));
}

// mapa strony dla Google
const today = new Date().toISOString().slice(0, 10);
await writeFile(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`zbudowano ${pages.length} stron + sitemap.xml + robots.txt`);
