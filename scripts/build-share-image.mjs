// Generates pages/public/og-image.png: the 1200×630 preview shown when the site is shared on WhatsApp, X, Facebook…
// Run with `npm run share-image` after changing the logo or wording.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const siteRoot = join(import.meta.dirname, '..');
const logo = join(siteRoot, 'assets/images/logo/logo-original.jpg');
const outDir = join(siteRoot, 'pages/public');
const WIDTH = 1200;
const HEIGHT = 630;
const BADGE = 300;

// Same logo circle as the site emblem: centre (298, 242) in the source, padded radius 94.
const CX = 298;
const CY = 242;
const R = 94;

const background = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0.55">
      <stop offset="0" stop-color="#053b2c"/>
      <stop offset="0.3" stop-color="#0b6b50"/>
      <stop offset="0.48" stop-color="#1bb184"/>
      <stop offset="0.62" stop-color="#0a5c45"/>
      <stop offset="1" stop-color="#04301f"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#metal)"/>
  <rect width="100%" height="100%" fill="#03261c" opacity="0.25"/>
  <circle cx="${120 + BADGE / 2}" cy="${HEIGHT / 2}" r="${BADGE / 2 + 14}" fill="#ffffff" opacity="0.18"/>
  <text x="505" y="285" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" fill="#ffffff">Mind Over Matter</text>
  <text x="512" y="350" font-family="'Segoe UI', Arial, sans-serif" font-size="32" fill="#d9fff0">Student mental health club in Kenya</text>
  <text x="512" y="420" font-family="'Segoe UI', Arial, sans-serif" font-size="26" fill="#b6f2cf">Support groups · Workshops · Community</text>
</svg>`);

const circle = Buffer.from(`<svg width="${BADGE}" height="${BADGE}"><circle cx="${BADGE / 2}" cy="${BADGE / 2}" r="${BADGE / 2}" fill="#fff"/></svg>`);

const badge = await sharp(logo)
  .extract({ left: CX - R, top: CY - R, width: R * 2, height: R * 2 })
  .resize(BADGE, BADGE, { kernel: 'lanczos3' })
  .ensureAlpha()
  .composite([{ input: circle, blend: 'dest-in' }])
  .png()
  .toBuffer();

mkdirSync(outDir, { recursive: true });
await sharp(background)
  .composite([{ input: badge, left: 120, top: Math.round((HEIGHT - BADGE) / 2) }])
  .png({ compressionLevel: 9, palette: false })
  .toFile(join(outDir, 'og-image.png'));

console.log(`Wrote ${join(outDir, 'og-image.png')}`);
