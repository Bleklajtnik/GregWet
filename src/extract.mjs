// Jednorazowa migracja treści ze starej strony WordPress (Divi) do src/content/*.json.
// Użycie: node src/extract.mjs   (czyta .work/old/*.html, pobiera zdjęcia do site/img/old/)
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const oldDir = join(root, '.work', 'old');
const outDir = join(root, 'src', 'content');
const imgDir = join(root, 'site', 'img', 'old');
const SITE = 'https://weterynarz.krakow.pl';

const pages = [
  'ostry-dyzur', 'uslugi-dodatkowe', 'kontakt', 'oferta', 'porady', 'galeria', 'personel', 'o-nas', 'polityka-prywatnosci',
  'oferta/endoskopia-zwierzat-krakow', 'oferta/bank-krwi', 'oferta/badania-ultrasonograficzne', 'oferta/badania-radiologiczne',
  'oferta/badania-laboratoryjne', 'oferta/profilaktyka', 'oferta/dermatologia', 'oferta/ortopedia', 'oferta/chirurgia',
  'oferta/medycyna-regeneracyjna', 'oferta/okulistyka', 'oferta/kardiologia',
  'opieka-nad-czworonogiem-w-sylwestra', 'upaly-zasady-prawidlowej-opieki', 'syndrom-zespol-okna-uchylnego', 'odrobaczanie',
  'kastracja-i-sterylizacja-mity-a-fakty', 'nowe-zwierze-w-domu', 'badanie-moczu', 'badania-krwi',
];

const decode = (s) => s
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#8222;/g, '„').replace(/&#8221;/g, '”')
  .replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘').replace(/&#8230;/g, '…').replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&amp;/g, '&');

const localHref = (href) => {
  if (!href) return href;
  if (href.startsWith(SITE)) {
    let p = href.slice(SITE.length) || '/';
    if (!p.startsWith('/')) p = '/' + p;
    return p;
  }
  return href;
};

const images = new Map();
const imgName = (src) => {
  const clean = src.split('?')[0];
  const name = basename(clean).replace(/-\d+x\d+(?=\.\w+$)/, '').replace(/[^a-zA-Z0-9._-]/g, '-');
  images.set(name, clean.replace(/-\d+x\d+(?=\.\w+$)/, ''));
  return `/img/old/${name}`;
};

function clean(html) {
  let h = html;
  h = h.replace(/<(script|style|noscript|iframe|form|svg)[\s\S]*?<\/\1>/gi, '');
  h = h.replace(/<!--[\s\S]*?-->/g, '');
  // nagłówki: h1 → h2, h4–h6 → h3
  h = h.replace(/<(\/?)h1\b/gi, '<$1h2').replace(/<(\/?)h[4-6]\b/gi, '<$1h3');
  // dozwolone znaczniki i atrybuty
  const allowed = new Set(['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote']);
  h = h.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (m, slash, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!allowed.has(tag)) return tag === 'div' && !slash ? '\n' : '';
    if (slash) return `</${tag}>`;
    if (tag === 'a') {
      const href = (attrs.match(/href="([^"]*)"/) || [])[1];
      if (!href || href.startsWith('http://Zadzwo')) return '<a>';
      return `<a href="${localHref(href)}">`;
    }
    if (tag === 'img') {
      const src = (attrs.match(/\ssrc="([^"]*)"/) || [])[1];
      if (!src || /logo|GREGWET/i.test(src)) return '';
      const alt = (attrs.match(/alt="([^"]*)"/) || attrs.match(/title="([^"]*)"/) || [])[1] || '';
      const w = (attrs.match(/width="(\d+)"/) || [])[1];
      const hh = (attrs.match(/height="(\d+)"/) || [])[1];
      return `<img src="${imgName(src)}" alt="${alt.replace(/[-_]/g, ' ')}"${w ? ` width="${w}"` : ''}${hh ? ` height="${hh}"` : ''} loading="lazy">`;
    }
    return `<${tag}>`;
  });
  h = h.replace(/<a>([\s\S]*?)<\/a>/g, '$1');
  h = decode(h);
  h = h.replace(/<(p|li|h2|h3|strong|b|em|i)>\s*<\/\1>/g, '').replace(/<p>\s*(<br>\s*)*<\/p>/g, '');
  h = h.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  return h;
}

await mkdir(outDir, { recursive: true });
await mkdir(imgDir, { recursive: true });

for (const slug of pages) {
  const file = join(oldDir, slug.replace(/\//g, '__') + '.html');
  const src = await readFile(file, 'utf8');
  const title = decode((src.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim();
  const description = decode((src.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim();
  const art = src.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  const post = src.match(/class="et_pb_post_content[^"]*"[^>]*>([\s\S]*?)<div class="et_pb_post_nav/);
  const body = art ? art[1] : post ? post[1] : '';
  const h1 = decode(((src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '')).trim();
  const date = (src.match(/<meta property="article:published_time" content="([^"]*)"/) || [])[1] || null;
  const og = (src.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  const cover = og && !/logo/i.test(og) ? imgName(og) : null;
  const html = clean(body);
  const data = { path: `/${slug}/`, title, description, h1, date, cover, html };
  await writeFile(join(outDir, slug.replace(/\//g, '__') + '.json'), JSON.stringify(data, null, 2));
  console.log(`${slug.padEnd(40)} ${String(html.length).padStart(6)} znaków  h1="${h1.slice(0, 40)}"`);
}

// zdjęcia z treści
let got = 0;
for (const [name, url] of images) {
  const target = join(imgDir, name);
  try { await access(target); continue; } catch {}
  const res = await fetch(url);
  if (!res.ok) { console.log('brak zdjęcia', url, res.status); continue; }
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
  got++;
}
console.log(`zdjęcia: ${images.size} w treści, pobrano ${got}`);
