import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

// Paths are worked out from this file's location, so the project builds on any computer or hosting service.
const siteRoot = import.meta.dirname.replaceAll('\\', '/');
const pagesRoot = resolve(siteRoot, 'pages');
const imagesRoot = resolve(siteRoot, 'assets/images');

// Every page of the site. Add new pages here as well as in pages/.
const pages = [
  'index.html',
  'event.html',
  'blog.html',
  'article.html',
  'about-us.html',
  'governance.html',
  'merch.html',
  'contact-us.html',
  'privacy.html',
  'admin.html',
  '404.html',
];

const fileTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};
const fsPrefix = `/@fs/${siteRoot}/`;

// The site's public web address, e.g. https://mindovermatterku.org (no trailing slash). Set it when building for
// the live site:  set SITE_URL=https://example.org && npm run build
// With it, share previews use full image links (required by WhatsApp/Facebook) and a sitemap is generated.
const SITE_URL = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
const SITE_NAME = 'Mind Over Matter';
const SHARE_IMAGE = '/og-image.png';
// Pages search engines should not list.
const PRIVATE_PAGES = new Set(['admin.html', '404.html']);

// Vercel serves pages without .html (see vercel.json), so links and the sitemap use that form.
const cleanPath = (page) => (page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`);

const escapeAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Adds social-share (Open Graph / Twitter) and canonical tags to every page from its own <title> and description,
// and writes robots.txt (plus sitemap.xml when SITE_URL is set) into the build.
function siteMeta(pageNames) {
  return {
    name: 'site-meta',
    transformIndexHtml(html, context) {
      const page = context.path.split('/').pop() || 'index.html';
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? SITE_NAME;
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      const pageUrl = SITE_URL ? `${SITE_URL}${cleanPath(page)}` : '';
      const tags = [
        ['og:type', 'website'],
        ['og:site_name', SITE_NAME],
        ['og:title', title],
        ['og:description', description],
        ['og:image', `${SITE_URL}${SHARE_IMAGE}`],
        ['og:image:width', '1200'],
        ['og:image:height', '630'],
        ['og:url', pageUrl],
      ].filter(([, value]) => value)
        .map(([property, value]) => `<meta property="${property}" content="${escapeAttribute(value)}" />`);
      tags.push('<meta name="twitter:card" content="summary_large_image" />');
      if (pageUrl && !PRIVATE_PAGES.has(page)) tags.push(`<link rel="canonical" href="${pageUrl}" />`);
      return html.replace('</title>', `</title>\n    ${tags.join('\n    ')}`);
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Disallow: /admin', 'Disallow: /admin.html'];
      if (SITE_URL) robots.push('', `Sitemap: ${SITE_URL}/sitemap.xml`);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });

      if (!SITE_URL) {
        this.warn('SITE_URL is not set: share previews use a relative image link and no sitemap.xml was generated.');
        return;
      }
      const urls = pageNames
        .filter((page) => !PRIVATE_PAGES.has(page) && page !== 'article.html')
        .map((page) => `  <url><loc>${SITE_URL}${cleanPath(page)}</loc></url>`);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      });
    },
  };
}

function sendFile(res, next, root, relativePath) {
  const file = resolve(root, `.${relativePath}`);
  const type = fileTypes[extname(file).toLowerCase()];
  if (!type || !file.startsWith(resolve(root) + sep)) return next();
  try {
    if (!statSync(file).isFile()) return next();
  } catch {
    return next();
  }
  res.setHeader('Content-Type', type);
  createReadStream(file).pipe(res);
}

// Dev-only workarounds; the production build resolves these paths on its own.
// 1. Page HTML refers to "../assets/images/...", which the browser requests as "/assets/images/..." outside the
//    pages root.
// 2. Vite's /@fs/ static serving fails for paths containing spaces (like "mind over matter"), so imported images
//    and PDFs would 404. Code files are unaffected because they go through Vite's transform pipeline instead.
function serveSiteFiles() {
  return {
    name: 'serve-site-files',
    configureServer(server) {
      server.middlewares.use('/assets/images', (req, res, next) => {
        sendFile(res, next, imagesRoot, decodeURIComponent(req.url.split('?')[0]));
      });
      server.middlewares.use((req, res, next) => {
        const [path, query = ''] = req.url.split('?');
        const decoded = decodeURIComponent(path);
        if (!decoded.startsWith(fsPrefix) || query.includes('import')) return next();
        sendFile(res, next, siteRoot, `/${decoded.slice(fsPrefix.length)}`);
      });
    },
  };
}

export default defineConfig({
  root: pagesRoot,
  plugins: [
    react(),
    serveSiteFiles(),
    siteMeta(pages),
    // Compresses every image the site uses when building for production (png, jpg, webp, svg).
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 78, mozjpeg: true },
      jpg: { quality: 78, mozjpeg: true },
      webp: { quality: 82 },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      allow: [siteRoot],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    outDir: resolve(siteRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page.replace('.html', ''), resolve(pagesRoot, page)])),
    },
  },
});
