// Servidor estático mínimo para rodar os testes de aceitação contra o site antigo (legacy/site.html).
// Uso: node scripts/serve-legacy.mjs [porta]  → http://localhost:4173/
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const html = readFileSync(new URL('../legacy/site.html', import.meta.url), 'utf8');
const page = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${html}</body></html>`;

createServer((req, res) => {
  if (req.url === '/' || req.url?.startsWith('/?') || req.url?.startsWith('/#')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(page);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('não encontrado');
}).listen(port, () => console.log(`site antigo em http://localhost:${port}/`));
