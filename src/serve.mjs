// Lokalny podgląd strony: serwuje folder site/ jak prawdziwy serwer (adresy /oferta/ itd. działają).
// Użycie: node src/serve.mjs   → http://localhost:4321  (8080 zajmuje na tym komputerze serwer PostgreSQL)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const port = Number(process.env.PORT) || 4321;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = normalize(join(site, url));
  if (!file.startsWith(site)) { res.writeHead(403).end(); return; }
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }).end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    const type = types[extname(file).toLowerCase()] || 'application/octet-stream';
    // filmy: obsługa Range, żeby przeglądarka mogła je odtwarzać
    const range = req.headers.range;
    if (range && type === 'video/mp4') {
      const [a, b] = range.replace('bytes=', '').split('-');
      const start = Number(a);
      const end = b ? Number(b) : body.length - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      res.end(body.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end('<h1>404 – nie ma takiej strony</h1><p><a href="/">Wróć na stronę główną</a></p>');
  }
}).listen(port, () => console.log(`Podgląd strony: http://localhost:${port}  (Ctrl+C kończy)`));
