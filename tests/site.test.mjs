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

test('mobile menu follows the page order and hides the duplicate noise CTA', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  const mobileCss = css.slice(css.indexOf('@media (max-width: 700px)'));
  const nav = html.match(/<nav\b[^>]*\bclass="site-nav"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
  const navTargets = [...nav.matchAll(/<a(?![^>]*\bclass="nav-cta")[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);

  assert.deepEqual(navTargets, ['#overview', '#noise-control', '#sound-engineering', '#comfort', '#specs']);

  const expectedOrder = [
    ['#overview', 1],
    ['#noise-control', 2],
    ['#sound-engineering', 3],
    ['#comfort', 4],
    ['#specs', 5],
  ];

  for (const [target, order] of expectedOrder) {
    assert.match(mobileCss, new RegExp(`\\.site-nav a\\[href="${target}"\\] \\{ order: ${order}; \\}`));
  }
  assert.match(mobileCss, /\.site-nav \.nav-cta \{ display: none; \}/);
});

test('page does not present the product as a practice or fictional item', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /练习网站|虚构产品/);
});

test('page sections follow the revised product story order', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(ids, [
    'overview',
    'highlights',
    'noise-control',
    'sound-engineering',
    'spatial-audio',
    'comfort',
    'specs',
    'closing',
  ]);
});

test('quiet luxury story removes the face-led reference chapter', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(ids, [
    'overview',
    'highlights',
    'noise-control',
    'sound-engineering',
    'spatial-audio',
    'comfort',
    'specs',
    'closing',
  ]);
  assert.doesNotMatch(html, /id="sound-quality"|vela-sound-reference|Dolby/i);
  assert.match(html, /<a href="#sound-engineering">音质<\/a>/);
});

test('story uses the approved anonymous visual assets', async () => {
  const html = await read('index.html');

  for (const asset of [
    'vela-quiet-anc.webp',
    'vela-quiet-transparency.webp',
    'vela-spatial-field.webp',
  ]) {
    assert.ok(html.includes(`assets/${asset}`), `page should use ${asset}`);
    const info = await stat(new URL(`../assets/${asset}`, import.meta.url));
    assert.equal(info.isFile(), true, `${asset} should be a file`);
  }

  assert.doesNotMatch(html, /vela-spatial-immersive|vela-anc-active|vela-transparency/);
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
    'vela-one-hero.png',
    'vela-quiet-anc.webp',
    'vela-quiet-transparency.webp',
    'vela-acoustics.webp',
    'vela-spatial-field.webp',
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

test('sound proof and spatial chapters stay product-led', async () => {
  const html = await read('index.html');
  const sound = html.match(/<section\b[^>]*\bid="sound-engineering"[^>]*>[\s\S]*?<\/section>/i)?.[0];
  const spatial = html.match(/<section\b[^>]*\bid="spatial-audio"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(sound, 'sound-engineering section should exist');
  assert.match(sound, /assets\/vela-acoustics\.webp/);
  assert.ok(spatial, 'spatial-audio section should exist');
  assert.match(spatial, /assets\/vela-spatial-field\.webp/);
  assert.doesNotMatch(spatial, /女性|人物|vela-spatial-immersive|spatial-modes|小米|Xiaomi|Dolby/i);
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

test('hero and primary highlight use the approved cinematic product assets', async () => {
  const html = await read('index.html');
  const hero = html.match(/<section\b[^>]*\bid="overview"[^>]*>[\s\S]*?<\/section>/i)?.[0];
  const highlights = html.match(/<section\b[^>]*\bid="highlights"[^>]*>[\s\S]*?<\/section>/i)?.[0];

  assert.ok(hero, 'overview hero should exist');
  assert.match(hero, /assets\/vela-one-hero\.png/);
  assert.match(hero, /fetchpriority="high"/);
  assert.doesNotMatch(hero, /vela-hero-studio-/);
  assert.ok(highlights, 'highlights should exist');
  assert.match(highlights, /assets\/vela-quiet-anc\.webp/);
});

test('sound-detail card jumps directly to the acoustic proof section', async () => {
  const html = await read('index.html');
  const card = [...html.matchAll(/<a class="feature-card" href="([^"]+)">[\s\S]*?<\/a>/g)]
    .find((match) => match[0].includes('听见每一层细节'));

  assert.ok(card, 'sound-detail card should exist');
  assert.equal(card[1], '#sound-engineering');
  assert.match(html, /<section class="story-section sound-section reveal" id="sound-engineering">/);
});

test('main site defines the approved cinematic color system', async () => {
  const css = await read('styles.css');

  for (const token of [
    '--night: #050607',
    '--night-soft: #0e1217',
    '--surface: #151a20',
    '--text: #f7f8fa',
    '--text-muted: #9aa4ad',
    '--metal: #d8dde1',
    '--accent: #4a9edd',
  ]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
  assert.match(css, /body\s*\{[^}]*background:\s*var\(--night\)/s);
});

test('mobile hero separates the copy from the cinematic product stage', async () => {
  const css = await read('styles.css');
  const mobileCss = css.slice(css.indexOf('@media (max-width: 700px)'));

  assert.match(mobileCss, /\.hero \{[^}]*display: grid;[^}]*grid-template-rows: auto minmax\(0, 1fr\);[^}]*text-align: center;/s);
  assert.match(mobileCss, /\.hero-copy \{[^}]*display: flex;[^}]*align-items: center;/s);
  assert.match(mobileCss, /\.product-stage-hero \{[^}]*position: relative;[^}]*height: 100%;[^}]*margin: 32px -18px 0;/s);
  assert.match(mobileCss, /\.hero-product-image \{[^}]*height: 100%;[^}]*object-fit: cover;[^}]*object-position: 70% center;/s);
});

test('highlights and noise control use the cinematic dark-surface treatment', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.highlights-section\s*\{[^}]*color:\s*var\(--text\)/s);
  assert.match(css, /\.feature-card\s*\{[^}]*background:\s*var\(--surface\)/s);
  assert.match(css, /\.noise-experience\s*\{[^}]*min-height:\s*100svh[^}]*background:\s*var\(--night-soft\)/s);
  assert.match(css, /\.noise-visual\s*\{[^}]*transition:\s*opacity 520ms cubic-bezier/);
});

test('sound proof is the ice-silver technical chapter within the dark story', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.sound-section\s*\{[^}]*color:\s*var\(--ink\)[^}]*background:\s*var\(--paper\)/s);
  assert.match(css, /\.sound-section \.story-illustration\s*\{[^}]*transition:\s*opacity 700ms cubic-bezier[^}]*transform 700ms cubic-bezier/s);
  assert.match(css, /\.immersive-campaign\s*\{[^}]*background:\s*var\(--night\)/s);
  assert.match(css, /\.story-silver\s*\{[^}]*color:\s*var\(--text\)[^}]*background:\s*var\(--night-soft\)/s);
});

test('specifications and closing keep the final chapters dark and motion-safe', async () => {
  const css = await read('styles.css');

  assert.match(css, /\.specs-section\s*\{[^}]*color:\s*var\(--text\)[^}]*background:\s*var\(--night-soft\)/s);
  assert.match(css, /\.battery-copy\s*\{[^}]*color:\s*var\(--text\)/s);
  assert.match(css, /\.closing-section\s*\{[^}]*background:\s*var\(--night\)/s);
  assert.match(css, /\.site-footer\s*\{[^}]*background:\s*var\(--night\)/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.sound-section \.story-illustration/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.js-enabled \.reveal\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/);
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
  assert.match(section, /data-noise-description[^>]*aria-live="polite"[^>]*aria-atomic="true"/);

  const visuals = [...section.matchAll(/<picture\b[^>]*data-noise-visual="([^"]+)"[^>]*>[\s\S]*?<\/picture>/gi)];
  assert.deepEqual(visuals.map((match) => match[1]).sort(), ['anc', 'transparency']);
  assert.match(visuals.find((match) => match[1] === 'anc')[0], /vela-quiet-anc\.webp/);
  assert.match(visuals.find((match) => match[1] === 'transparency')[0], /vela-quiet-transparency\.webp/);
});

test('reveal animation is progressive enhancement so content survives without JavaScript', async () => {
  const css = await read('styles.css');
  const script = await read('script.js');

  assert.match(css, /\.reveal\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/s);
  assert.match(css, /\.js-enabled \.reveal\s*\{[^}]*opacity:\s*0;[^}]*translateY\(18px\)/s);
  assert.match(css, /\.js-enabled \.reveal\.is-visible\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*none;/s);
  assert.match(script, /document\.documentElement\.classList\.add\('js-enabled'\)/);
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

test('design-system page exposes required tokens, sections, and accessible theme controls', async () => {
  const html = await read('design-system.html');
  const css = await read('design-system.css');
  const script = await read('design-system.js');
  const siteCss = await read('styles.css');

  for (const value of [
    'design-system.css', 'design-system.js', 'Design System',
    '色彩系统', '字体层级', '间距系统', '组件库',
    '#0B0E12', '#66717A', '#EDF1F3', '#0E1217', '#4A9EDD', '#FBFCFC',
    'clamp(2.5rem, 8vw, 4rem)', 'clamp(2rem, 6vw, 3rem)',
    '4px', '8px', '16px', '24px', '32px', '48px', '64px', '96px',
    'aria-pressed',
  ]) assert.ok(html.includes(value), `design system should include ${value}`);

  for (const value of [
    '--ds-ink: #0b0e12', '--ds-accent: #4a9edd',
    '--ds-font-h1:', '--ds-font-h2:', '--ds-font-body:', '--ds-font-caption:',
    '.ds-color-card', '.ds-color-card__swatch', '.ds-button--primary',
    '.ds-button--secondary', '.ds-card--large', '.ds-nav--expanded',
    '@media (min-width: 720px)', 'prefers-reduced-motion', ':focus-visible',
  ]) assert.ok(css.includes(value), `design CSS should include ${value}`);

  for (const value of ['localStorage', 'prefers-color-scheme', 'aria-pressed', 'dataset.theme']) {
    assert.ok(script.includes(value), `theme script should include ${value}`);
  }

  assert.match(siteCss, /--accent:\s*#4a9edd;/i);
});

test('deployment workflow copies the design-system files', async () => {
  const workflow = await read('.github/workflows/deploy.yml');

  for (const file of ['design-system.html', 'design-system.css', 'design-system.js']) {
    assert.ok(workflow.includes(file), `deployment workflow should copy ${file}`);
  }
});
