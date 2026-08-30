import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

test('page exposes product sections and navigation controls', async () => {
  const html = await read('index.html');

  for (const value of [
    'Vela One',
    'class="menu-toggle"',
    'class="site-nav"',
    'href="#highlights">探索 Vela One',
    'href="#noise-control">体验降噪',
  ]) {
    assert.match(html, new RegExp(value));
  }
});

test('footer does not show the practice-product disclaimer', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /用于网页设计练习的虚构产品/);
});

test('page sections follow the revised product story order', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(ids, [
    'overview',
    'highlights',
    'noise-control',
    'sound-quality',
    'sound-engineering',
    'spatial-audio',
    'comfort',
    'specs',
    'closing',
  ]);
});

test('page has concise large headings without line-break markup', async () => {
  const html = await read('index.html');
  const headings = [...html.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)];

  assert.ok(headings.length >= 8);
  for (const heading of headings) {
    assert.equal(/<br\b/i.test(heading[0]), false);
    const text = heading[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&#(?:44|x2c);/gi, ',');
    assert.equal(/[，,]/.test(text), false);
  }
});

test('page references the revised visual assets that exist on disk', async () => {
  const html = await read('index.html');
  const assets = [
    'vela-hero-studio-desktop-v2.webp',
    'vela-hero-studio-tablet.webp',
    'vela-hero-studio-mobile.webp',
    'vela-acoustics.webp',
    'vela-anc-desktop-clean.webp',
    'vela-anc-active-desktop.webp',
    'vela-anc-active-mobile.webp',
    'vela-transparency-desktop.webp',
    'vela-transparency-mobile.webp',
    'vela-sound-reference.webp',
    'vela-spatial-immersive-desktop.webp',
    'vela-spatial-immersive-mobile.webp',
    'vela-fit-closeup-clean.webp',
    'vela-case-still.webp',
  ];

  const assetReferences = [
    ...html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi),
  ].map((match) => match[1]);
  for (const source of html.matchAll(/<source\b[^>]*\bsrcset\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    assetReferences.push(...source[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0]));
  }

  for (const asset of assets) {
    assert.ok(assetReferences.includes(`assets/${asset}`), `HTML should use ${asset} in img src or source srcset`);
    const info = await stat(new URL(`../assets/${asset}`, import.meta.url));
    assert.equal(info.isFile(), true, `${asset} should be a file`);
  }
});

test('sound section uses the approved reference image while spatial remains original Vela', async () => {
  const html = await read('index.html');
  const sound = html.match(/<section\b[^>]*\bid="sound-quality"[^>]*>[\s\S]*?<\/section>/i)?.[0];
  const spatial = html.match(/<section\b[^>]*\bid="spatial-audio"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(sound, 'sound-quality section should exist');
  assert.match(sound, /class="reference-sound-section reveal"/);
  assert.match(sound, /assets\/vela-sound-reference\.webp/);
  assert.doesNotMatch(sound, /Vela Studio Sound|vela-studio-sound|sound-signatures/);
  assert.ok(spatial, 'spatial-audio section should exist');
  for (const label of ['标准', '音乐', '视频', '听书', '游戏']) assert.match(spatial, new RegExp(label));
  assert.doesNotMatch(spatial, /小米|Xiaomi|Dolby/i);
});

test('sound engineering combines listening promise, codec evidence, and certification badges', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  const section = html.match(/<section\b[^>]*\bid="sound-engineering"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(section, 'sound-engineering section should exist');
  for (const value of [
    '从传输到发声',
    '每一层都清晰归位',
    'LHDC-V5',
    '最高 24-bit/192kHz',
    '双 DAC',
    '11 mm + 6.7 mm',
    'assets/lhdc-logo.svg',
    'assets/hi-res-audio-wireless.jpg',
  ]) {
    assert.ok(section.includes(value), `sound-engineering should include ${value}`);
  }

  assert.equal((section.match(/LHDC-V5/g) || []).length, 1, 'LHDC-V5 should not be repeated');
  const details = section.match(/<div\b[^>]*\bclass="sound-details"[^>]*>[\s\S]*?<\/div>\s*<\/section>/i)?.[0];
  assert.ok(details, 'proof and certification should share one sound-details group');
  assert.match(details, /class="sound-proof-grid"/);
  assert.match(details, /class="certification-row"/);
  assert.match(details, /高解析音频认证/);
  assert.match(section, /class="sound-proof-grid"/);
  assert.match(section, /class="certification-row"/);
  for (const value of ['.sound-details', '.sound-proof-grid', '.certification-row', '.certification-badge']) {
    assert.ok(css.includes(value), `stylesheet should include ${value}`);
  }
  assert.match(css, /\.sound-section h2 \{ max-width: 560px; font-size: clamp\(44px, 4\.2vw, 62px\);/);

  for (const asset of ['lhdc-logo.svg', 'hi-res-audio-wireless.jpg']) {
    const info = await stat(new URL(`../assets/${asset}`, import.meta.url));
    assert.equal(info.isFile(), true, `${asset} should be a file`);
  }
});

test('hero uses product-only studio assets instead of the former lifestyle background', async () => {
  const html = await read('index.html');
  const hero = html.match(/<section\b[^>]*\bid="overview"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(hero, 'overview hero should exist');
  assert.match(hero, /assets\/vela-hero-studio-desktop-v2\.webp/);
  assert.match(hero, /assets\/vela-hero-studio-tablet\.webp/);
  assert.match(hero, /assets\/vela-hero-studio-mobile\.webp/);
  assert.doesNotMatch(hero, /assets\/vela-hero-(?:desktop|mobile)\.webp/);
  assert.doesNotMatch(hero, /女子|人物|窗外|城市|天际线/);
});

test('noise experience exposes accessible mode controls and description state', async () => {
  const html = await read('index.html');
  const section = html.match(/<section\b[^>]*\bid="noise-control"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(section, 'noise-control section should exist');
  const opening = section.match(/^<section\b[^>]*>/i)?.[0];
  assert.match(opening, /class="[^"]*\bnoise-experience\b[^"]*"/i);
  assert.match(opening, /data-mode="anc"/i);
  const modeButtons = [...section.matchAll(/<button\b[^>]*data-noise-mode="([^"]+)"[^>]*>[\s\S]*?<\/button>/gi)];

  assert.equal(modeButtons.length, 2);
  assert.deepEqual(modeButtons.map((match) => match[1]).sort(), ['anc', 'transparency']);
  assert.ok(modeButtons.every((match) => /aria-pressed="(?:true|false)"/.test(match[0])));
  assert.match(section, /aria-pressed="true"/);
  assert.match(section, /data-noise-title\b/);
  assert.match(section, /data-noise-description\b/);

  const visuals = [...section.matchAll(/<picture\b[^>]*data-noise-visual="([^"]+)"[^>]*>[\s\S]*?<\/picture>/gi)];
  assert.deepEqual(visuals.map((match) => match[1]).sort(), ['anc', 'transparency']);
  assert.match(visuals.find((match) => match[1] === 'anc')[0], /vela-anc-active-(?:desktop|mobile)\.webp/);
  assert.match(visuals.find((match) => match[1] === 'transparency')[0], /vela-transparency-(?:desktop|mobile)\.webp/);
});

test('stylesheet supports revised feature sections and motion-safe presentation', async () => {
  const css = await read('styles.css');

  for (const value of [
    ':root',
    '.site-header.is-scrolled',
    '.site-nav.is-open',
    '.reveal.is-visible',
    '.feature-grid',
    '.feature-card',
    '.sound-section',
    '.noise-experience',
    '[data-mode="transparency"]',
    '.closing-section',
    '@media (max-width: 700px)',
    'prefers-reduced-motion',
  ]) {
    assert.ok(css.includes(value));
  }
});

test('mobile highlights condense the five reasons into one wide card and four paired cards', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.feature-grid\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);\s*grid-template-rows:\s*250px;\s*grid-auto-rows:\s*226px;\s*gap:\s*12px;/);
  assert.match(css, /\.feature-card, \.feature-card:nth-child\(1\), \.feature-card:nth-child\(2\), \.feature-card:nth-child\(n \+ 3\)\s*\{\s*grid-column:\s*auto;\s*min-height:\s*226px;\s*border-radius:\s*18px;/);
  assert.match(css, /\.feature-card:nth-child\(1\)\s*\{\s*grid-column:\s*1 \/ -1;\s*min-height:\s*250px;/);
  assert.match(css, /\.feature-card strong\s*\{\s*white-space:\s*normal;\s*line-height:\s*1\.08;/);
});

test('mobile noise experience keeps controls and both mode visuals in one viewport', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.noise-experience\s*\{\s*display:\s*grid;\s*align-items:\s*start;\s*min-height:\s*max\(640px,\s*100svh\)/);
  assert.match(css, /\.noise-experience \.story-copy\s*\{\s*max-width:\s*none;\s*padding:\s*82px[^}]*background:\s*transparent/);
  assert.match(css, /\.noise-experience \.story-illustration\s*\{\s*position:\s*absolute;\s*inset:\s*0;\s*z-index:\s*-2;\s*width:\s*auto;\s*height:\s*auto/);
  assert.match(css, /\.noise-experience::before\s*\{[^}]*display:\s*block[^}]*linear-gradient\(180deg/);
  assert.match(css, /\.noise-experience \.story-illustration img\s*\{\s*object-position:\s*center/);
});

test('script includes menu, header, reveal, date, and noise hooks', async () => {
  const script = await read('script.js');

  for (const value of [
    'menuToggle',
    'setMenuState',
    'aria-expanded',
    'is-open',
    'is-scrolled',
    'IntersectionObserver',
    'is-visible',
    'getFullYear',
    "menuToggle.textContent = open ? '关闭' : '菜单'",
    'noiseModeButtons',
    'setNoiseMode',
    'aria-pressed',
    'dataset.mode',
  ]) {
    assert.ok(script.includes(value));
  }
});
