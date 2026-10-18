import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(project, 'dist');
const output = join(project, 'build');

mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

// Use the final production domain for link previews, including WhatsApp.
// SITE_URL can override it when adding a custom domain or using another host.
const domain = process.env.SITE_URL
  || process.env.VERCEL_PROJECT_PRODUCTION_URL
  || process.env.VERCEL_URL;

if (domain) {
  const url = new URL(/^https?:\/\//.test(domain) ? domain : `https://${domain}`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL.');
  const pageUrl = `${url.origin}/`;
  const imageUrl = new URL('assets/foto1.png', pageUrl).href;
  const htmlPath = join(output, 'index.html');
  const html = readFileSync(htmlPath, 'utf8')
    .replace('content="/assets/foto1.png"', `content="${imageUrl}"`)
    .replace('  <title>', `  <meta property="og:url" content="${pageUrl}">\n  <link rel="canonical" href="${pageUrl}">\n  <title>`);
  writeFileSync(htmlPath, html);
}

console.log('Invitación lista en build/.');
