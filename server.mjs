import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.MARKETING_PORT || 5180);
const productUrl = new URL(process.env.SOKER_PRODUCT_URL || 'http://127.0.0.1:5174/find');
if (!['http:', 'https:'].includes(productUrl.protocol)) throw new Error('SOKER_PRODUCT_URL must use HTTP or HTTPS');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.fnt': 'text/plain', '.ico': 'image/x-icon' };

http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (url.pathname === '/product') {
      response.writeHead(302, { Location: productUrl.href, 'Cache-Control': 'no-store' }).end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep) || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(filename);
    if (!info.isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
    const data = request.method === 'HEAD' ? null : await readFile(filename);
    response.writeHead(200, {
      'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': /\.(?:buf|webp|woff2?|png|jpg|exr)$/.test(filename) ? 'public, max-age=3600' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    }).end(data);
  } catch (error) {
    const status = error.code === 'ENOENT' || error instanceof URIError ? 404 : 500;
    console.error(`[marketing] ${status} ${request.url}: ${error.message}`);
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(status === 404 ? 'Not found' : 'Unable to load resource');
  }
}).listen(port, '127.0.0.1', () => console.log(`Soker website: http://127.0.0.1:${port}\nProduct entry: ${productUrl.href}`));
