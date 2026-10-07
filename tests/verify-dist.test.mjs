import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
export const CASE_SLUGS = ['llm-cost-migration', 'banking-mcp-server', 'swim-school-ops-saas'];
const SITE = 'https://russkaye.github.io/';
// Generic money pattern only; named terms come from the out-of-git list (TERMS, below).
const DOLLARS = /\$\s?\d+(\.\d+)?\s?k\b/i;

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = existsSync(DIST) ? walk(DIST) : [];
const textFiles = files.filter((f) => ['.html', '.xml', '.txt', '.js', '.css', '.json', '.svg'].includes(extname(f)));
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const read = (f) => readFileSync(f, 'utf8');
const rel = (f) => f.slice(DIST.length);

test('dist exists', () => assert.ok(files.length > 0, 'run `npm run build` first'));

// The confidential term list lives outside git: CONFIDENTIAL_TERMS (CI secret) or the gitignored .confidential-terms file.
const TERMS_FILE = fileURLToPath(new URL('../.confidential-terms', import.meta.url));
const termSource = process.env.CONFIDENTIAL_TERMS || (existsSync(TERMS_FILE) ? readFileSync(TERMS_FILE, 'utf8') : '');
const TERMS = termSource.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#')).map((s) => new RegExp(s, 'i'));

test('confidential term list is configured (fail closed)', () => {
  assert.ok(TERMS.length >= 10, `expected >=10 confidential terms, got ${TERMS.length}; set CONFIDENTIAL_TERMS or create .confidential-terms`);
});

test('no confidential terms in any tracked repo file (the repo is public)', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const binary = /\.(png|jpe?g|webp|pdf|woff2?|ico)$/i;
  const hits = [];
  for (const f of tracked.filter((t) => !binary.test(t))) {
    const body = readFileSync(join(root, f), 'utf8');
    for (const re of TERMS) if (re.test(body)) hits.push(`${f} ~ ${re}`);
  }
  assert.deepEqual(hits, []);
});

test('required files exist', () => {
  const required = [
    'index.html', '404.html', 'resume.pdf', 'russell.jpg', 'russell.webp', 'og.png',
    'favicon.svg', 'robots.txt', 'sitemap-index.xml',
    ...CASE_SLUGS.map((s) => `work/${s}/index.html`),
  ];
  const missing = required.filter((r) => !existsSync(join(DIST, r)));
  assert.deepEqual(missing, []);
});

test('no confidential terms anywhere in text output', () => {
  const hits = [];
  for (const f of textFiles) {
    const body = read(f);
    for (const re of [...TERMS, DOLLARS]) if (re.test(body)) hits.push(`${rel(f)} ~ ${re}`);
  }
  assert.deepEqual(hits, []);
});

test('internal links and same-page anchors resolve', () => {
  const broken = [];
  for (const f of htmlFiles) {
    const html = read(f);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
      if (href.startsWith('#')) {
        if (href.length > 1 && !ids.has(href.slice(1))) broken.push(`${rel(f)} -> ${href}`);
        continue;
      }
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const path = href.split('#')[0].split('?')[0];
      const target = join(DIST, path);
      const ok = (existsSync(target) && statSync(target).isFile()) || existsSync(join(target, 'index.html'));
      if (!ok) broken.push(`${rel(f)} -> ${href}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('every inline svg is responsive (has viewBox)', () => {
  const bad = [];
  for (const f of htmlFiles) {
    for (const [tag] of read(f).matchAll(/<svg\b[^>]*>/g)) if (!/viewBox=/.test(tag)) bad.push(`${rel(f)}: ${tag.slice(0, 60)}`);
  }
  assert.deepEqual(bad, []);
});

test('og:image is absolute on every page', () => {
  for (const f of htmlFiles) {
    const m = read(f).match(/<meta property="og:image" content="([^"]+)"/);
    assert.ok(m, `no og:image in ${rel(f)}`);
    assert.ok(m[1].startsWith(SITE), `relative og:image in ${rel(f)}: ${m[1]}`);
  }
});

test('primary CTA downloads a real PDF', () => {
  const home = read(join(DIST, 'index.html'));
  assert.match(home, /href="\/resume\.pdf"[^>]*download="Russell_Abregande_Resume\.pdf"|download="Russell_Abregande_Resume\.pdf"[^>]*href="\/resume\.pdf"/);
  assert.equal(readFileSync(join(DIST, 'resume.pdf')).subarray(0, 4).toString(), '%PDF');
});

test('portrait has no EXIF metadata', () => {
  const buf = readFileSync(join(DIST, 'russell.jpg'));
  assert.equal(buf.indexOf(Buffer.from('Exif\0\0')), -1, 'EXIF found in russell.jpg');
});

test('home has the agreed CTAs and no freelance content', () => {
  const home = read(join(DIST, 'index.html'));
  assert.match(home, /href="mailto:russabregande@gmail\.com"/);
  assert.doesNotMatch(home, /calendly|roi calculator|free audit|teardown/i);
});

test('diagram svgs use theme colours only (no hard-coded hex)', () => {
  const bad = [];
  for (const slug of CASE_SLUGS) {
    const html = read(join(DIST, `work/${slug}/index.html`));
    for (const [svg] of html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
      if (/(fill|stroke)="#[0-9a-f]{3,6}"/i.test(svg)) bad.push(slug);
    }
  }
  assert.deepEqual(bad, []);
});

test('theme text colours meet WCAG AA (4.5:1) in light and dark', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const block = (re) => Object.fromEntries([...css.match(re)[1].matchAll(/--(\w+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
  const light = block(/:root\s*\{([^}]*)\}/);
  const dark = block(/prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/);
  const lum = (h) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const low = [];
  for (const [name, t] of [['light', light], ['dark', dark]]) {
    for (const fg of ['text', 'muted', 'accent']) for (const bg of ['bg', 'surface']) {
      const r = ratio(t[fg], t[bg]);
      if (r < 4.5) low.push(`${name} ${fg} on ${bg}: ${r.toFixed(2)}`);
    }
  }
  assert.deepEqual(low, []);
});
