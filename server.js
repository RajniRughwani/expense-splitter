import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ...['app', 'model', 'summary'].map(name => [`/src/${name}.js`, [`src/${name}.js`, 'text/javascript']]),
]);
const server = http.createServer(async (req, res) => {
  const entry = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(entry[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Unable to load file'); }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, '127.0.0.1', () => console.log(`Expense splitter: http://localhost:${port}`));
