import sharp from 'sharp';

const SRC = 'assets-src/portrait-source.jpeg';
const meta = await sharp(SRC).metadata();
// Square head-and-shoulders crop: full width, starting ~6% from the top.
const side = Math.min(meta.width, meta.height);
const crop = { left: Math.round((meta.width - side) / 2), top: Math.round(meta.height * 0.06), width: side, height: Math.min(side, meta.height - Math.round(meta.height * 0.06)) };
const base = sharp(SRC).rotate().extract(crop).resize(480, 480, { fit: 'cover' });
await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile('public/russell.jpg');
await base.clone().webp({ quality: 80 }).toFile('public/russell.webp');

// OG image 1200x630: paper background, portrait left, name + stat right.
const portrait = await base.clone().resize(420, 420).png().toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f6f1e9"/>
  <text x="560" y="190" font-family="Georgia, serif" font-size="30" letter-spacing="5" fill="#b4532a">APPLIED AI ENGINEER</text>
  <text x="560" y="270" font-family="Georgia, serif" font-size="64" fill="#1d1b18">Russell Abregande</text>
  <text x="560" y="410" font-family="Georgia, serif" font-size="120" fill="#b4532a">74%</text>
  <text x="560" y="465" font-family="Arial, sans-serif" font-size="30" fill="#7a7066">less LLM spend · 30 production agents</text>
</svg>`;
await sharp(Buffer.from(svg)).composite([{ input: portrait, left: 90, top: 105 }]).png().toFile('public/og.png');
console.log('assets written');
