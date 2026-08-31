# Vela One Quiet Luxury Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 将 Vela One 改造成以产品、安静空间和可信声学证据为主角的“安静高级”产品故事页。

**Architecture:** 保持静态 HTML、单一 CSS 与原生 JavaScript 架构。删除独立的杜比参考章节，导航音质入口直接指向声学证明；复用现有产品、结构、耳部局部和充电盒素材，只新增无人通勤的 ANC 双状态画面与无人物空间声场画面。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、Node.js 内置测试、GitHub Actions、Cloudflare Pages

**Spec:** docs/superpowers/specs/2026-08-31-vela-one-quiet-luxury-redesign-design.md

## Global Constraints

- 不显示完整人脸，不引入新模特身份；人体仅可作为耳部或手部的功能局部。
- 首屏先展示产品的高级感，手机端文案与产品上下分区。
- 降噪与通透模式使用相同构图的无人通勤场景，保持现有无障碍状态更新。
- 保留双 DAC、11 mm + 6.7 mm、LHDC-V5、LHDC 与 Hi-Res Wireless 官方徽标；不虚构规格或认证。
- 手机菜单顺序固定为“概览、降噪、音质、佩戴、规格”，隐藏重复 CTA。
- 不增加第三方运行时依赖、Canvas、视频、3D 库或构建框架。
- 支持 prefers-reduced-motion: reduce；JavaScript 不可用时正文仍可阅读。
- 每个任务提交前运行 node tests/site.test.mjs 与 git diff --check。

---

## File Map

- Create: assets/vela-quiet-anc.webp — 无人地铁、安静降噪状态。
- Create: assets/vela-quiet-transparency.webp — 与 ANC 同机位、环境重新清晰的通透状态。
- Create: assets/vela-spatial-field.webp — 无人物的产品空间声场。
- Modify: index.html — 删除杜比参考章节，改用无人素材，更新锚点、文案和替代文本。
- Modify: styles.css — 重建静默展厅、无人通勤和声场章节的视觉布局。
- Modify: script.js — 只更新降噪状态文案；保留菜单、滚动头部与 reveal 行为。
- Modify: tests/site.test.mjs — 锁定章节顺序、无人物资源、锚点、模式切换与响应式回归。
- Read only: .github/workflows/deploy.yml — 已自动复制 assets/ 并运行测试。

### Task 1: Lock the face-free story contract

**Files:**
- Modify: tests/site.test.mjs
- Modify: index.html

**Interfaces:**
- Consumes: existing section IDs and navigation markup.
- Produces: no #sound-quality; audio navigation and the detail card target #sound-engineering.

- [ ] **Step 1: Write the failing structural tests**

~~~js
test('quiet luxury story removes the face-led reference chapter', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(ids, [
    'overview', 'highlights', 'noise-control', 'sound-engineering',
    'spatial-audio', 'comfort', 'specs', 'closing',
  ]);
  assert.doesNotMatch(html, /id="sound-quality"|vela-sound-reference|Dolby/i);
  assert.match(html, /<a href="#sound-engineering">音质<\/a>/);
});

test('story uses the approved anonymous visual assets', async () => {
  const html = await read('index.html');
  for (const asset of [
    'vela-quiet-anc.webp', 'vela-quiet-transparency.webp', 'vela-spatial-field.webp',
  ]) assert.ok(html.includes('assets/' + asset));
  assert.doesNotMatch(html, /vela-spatial-immersive|vela-anc-active|vela-transparency/);
});
~~~

- [ ] **Step 2: Run the focused tests and verify failure**

~~~powershell
node --test --test-name-pattern="quiet luxury story|anonymous visual assets" tests/site.test.mjs
~~~

Expected: FAIL because the current page still includes the sound reference and face-led ANC/spatial assets.

- [ ] **Step 3: Apply the minimal HTML contract**

Change the top navigation audio link to:

~~~html
<a href="#sound-engineering">音质</a>
~~~

Delete the complete sound-quality section. Keep the acoustic proof section and its existing sound-engineering feature-card link.

- [ ] **Step 4: Run the focused tests again**

~~~powershell
node --test --test-name-pattern="quiet luxury story|anonymous visual assets" tests/site.test.mjs
~~~

Expected: the structural assertion passes; the image assertion remains failing until Task 2 and Task 3 are complete.

### Task 2: Create product-consistent anonymous scenes

**Files:**
- Create: assets/vela-quiet-anc.webp
- Create: assets/vela-quiet-transparency.webp
- Create: assets/vela-spatial-field.webp

**Interfaces:**
- Consumes: assets/vela-one-hero.png as product-shape and ice-silver finish reference.
- Produces: three image files with no readable text, badge, logo, complete person or face.

- [ ] **Step 1: Inspect the product reference**

Inspect assets/vela-one-hero.png to lock the earbud and case shape, ice-silver finish, and lighting direction. Do not copy its surrounding scene.

- [ ] **Step 2: Generate the matched ANC pair**

Use the same prompt and composition twice:

~~~text
Premium editorial product photograph, empty modern subway carriage at night, ice-silver stem-style true wireless earbuds and open charging case on a dark brushed-metal seat in the lower-right foreground, tall window on the left with passing city lights, no people, no hands, no text, no logo, no watermark. Black graphite palette, controlled cool-blue rim light, cinematic but quiet, product crisp and accurate to the supplied Vela One reference, wide 16:9 composition.
~~~

For vela-quiet-anc.webp, make the outside lights stretched and subdued, carriage shadows deep, product sharply isolated. For vela-quiet-transparency.webp, keep the same camera position, object placement and product scale, while making the window, seat texture and outside city cues clearer and slightly warmer.

- [ ] **Step 3: Generate the space-audio product scene**

~~~text
Premium product photograph of ice-silver stem-style true wireless earbuds floating with their charging case in a vast black exhibition space, no people, no hands, no text, no logo, no watermark. Three to five thin translucent cool-blue sound-field rings recede behind the product, precise hard rim light, black graphite floor with a soft reflection, calm luxury, not neon, not sci-fi clutter, product accurate to the supplied Vela One reference, portrait 2:3 composition.
~~~

Save it as assets/vela-spatial-field.webp.

- [ ] **Step 4: Verify the accepted outputs**

~~~powershell
Get-Item assets/vela-quiet-anc.webp, assets/vela-quiet-transparency.webp, assets/vela-spatial-field.webp |
  Select-Object Name, Length
~~~

Expected: every file exists and has a non-zero size. Visually inspect: no face, no person, no readable text, no malformed or wrong-colour earbud.

### Task 3: Connect scenes, states, and concise copy

**Files:**
- Modify: index.html
- Modify: script.js
- Modify: tests/site.test.mjs

**Interfaces:**
- Consumes: assets from Task 2 and existing data-noise-mode API.
- Produces: ANC and transparency states using a matched pair; spatial section with no face-led image.

- [ ] **Step 1: Complete the asset tests**

~~~js
assert.match(html, /src="assets\/vela-quiet-anc\.webp"/);
assert.match(html, /src="assets\/vela-quiet-transparency\.webp"/);
assert.match(html, /src="assets\/vela-spatial-field\.webp"/);
~~~

- [ ] **Step 2: Replace both ANC images**

~~~html
<picture class="noise-visual" data-noise-visual="anc" aria-hidden="true">
  <img src="assets/vela-quiet-anc.webp" alt="" width="1536" height="864" loading="lazy" decoding="async" />
</picture>
<picture class="noise-visual" data-noise-visual="transparency" aria-hidden="true">
  <img src="assets/vela-quiet-transparency.webp" alt="" width="1536" height="864" loading="lazy" decoding="async" />
</picture>
~~~

Keep data-mode, button labels and aria-pressed values unchanged.

- [ ] **Step 3: Replace the spatial image and remove decorative scenario labels**

~~~html
<img src="assets/vela-spatial-field.webp" alt="冰银 Vela One 耳机在黑色展厅中被空间声场环绕" width="1024" height="1536" loading="lazy" decoding="async" />
~~~

Delete the complete spatial-modes list. Keep the title and set its paragraph to: 声音保持在应在的位置。无论转向屏幕、舞台或窗外，方向与距离都清楚稳定。

- [ ] **Step 4: Synchronize mode copy with scene**

~~~js
anc: {
  title: '把喧闹留在外面',
  description: '轨道、人群与城市声退到远处，只留下你想听见的部分。',
},
transparency: {
  title: '让重要的声音靠近',
  description: '车厢提示、对话和环境方向重新清晰，无需摘下耳机。',
},
~~~

- [ ] **Step 5: Run tests and commit**

~~~powershell
node tests/site.test.mjs
git diff --check
git add index.html script.js tests/site.test.mjs
git commit -m "feat: tell Vela story without a face-led model"
~~~

### Task 4: Stage the quiet exhibition in CSS

**Files:**
- Modify: styles.css
- Modify: tests/site.test.mjs

**Interfaces:**
- Consumes: existing selector names plus Task 3 markup.
- Produces: product-first hero, full-screen ANC contrast, black spatial gallery and mobile-safe layout.

- [ ] **Step 1: Write layout contract tests**

~~~js
test('quiet luxury layout keeps product, space, and proof in distinct chapters', async () => {
  const css = await read('styles.css');
  assert.match(css, /\.hero\s*\{[^}]*background:\s*var\(--night\)/s);
  assert.match(css, /\.noise-experience\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /\.immersive-campaign\s*\{[^}]*background:\s*var\(--night\)/s);
  assert.match(css, /\.sound-section\s*\{[^}]*background:\s*var\(--paper\)/s);
});

test('mobile quiet luxury layout separates copy and preserves touch controls', async () => {
  const css = await read('styles.css');
  const mobile = css.slice(css.indexOf('@media (max-width: 700px)'));
  assert.match(mobile, /\.hero\s*\{[^}]*grid-template-rows:\s*auto minmax\(0, 1fr\)/s);
  assert.match(mobile, /\.mode-switch button\s*\{[^}]*min-height:\s*44px/s);
  assert.match(mobile, /\.site-nav \.nav-cta\s*\{\s*display:\s*none;/);
});
~~~

- [ ] **Step 2: Set gallery-like contrast hierarchy**

~~~css
.hero::after {
  background: linear-gradient(90deg, rgba(5, 6, 7, 0.94) 0%, rgba(5, 6, 7, 0.5) 38%, transparent 72%);
}
.noise-experience::before {
  background: linear-gradient(90deg, rgba(5, 6, 7, 0.9) 0%, rgba(5, 6, 7, 0.56) 36%, rgba(5, 6, 7, 0.08) 74%);
}
.noise-experience[data-mode="transparency"]::before {
  background: linear-gradient(90deg, rgba(34, 39, 43, 0.76) 0%, rgba(34, 39, 43, 0.34) 40%, rgba(34, 39, 43, 0.04) 74%);
}
.immersive-campaign::after {
  background: linear-gradient(90deg, rgba(3, 4, 5, 0.93) 0%, rgba(3, 4, 5, 0.48) 40%, rgba(3, 4, 5, 0.06) 72%);
}
~~~

Keep the dark Bento overview and the paper-coloured acoustic proof as the only bright technical chapter.

- [ ] **Step 3: Remove obsolete CSS**

Delete the reference-sound-section and spatial-modes rule groups. Do not leave unused selectors for deleted HTML.

- [ ] **Step 4: Set mobile scene framing**

~~~css
@media (max-width: 700px) {
  .noise-experience .story-illustration img { object-position: 58% center; }
  .immersive-campaign { min-height: max(720px, 100svh); }
  .campaign-visual img { object-position: center 58%; }
  .campaign-copy > p:not(.eyebrow) { max-width: 320px; }
}
~~~

At 390 × 844 px and 430 × 932 px, the controls, current title and visual scene core must be visible together without another scroll.

- [ ] **Step 5: Run tests and commit**

~~~powershell
node tests/site.test.mjs
git diff --check
git add styles.css tests/site.test.mjs
git commit -m "style: stage Vela as a quiet exhibition"
~~~

### Task 5: Validate, deploy, and verify public page

**Files:**
- Verify: index.html
- Verify: styles.css
- Verify: script.js
- Verify: tests/site.test.mjs

**Interfaces:**
- Consumes: all completed commits and existing GitHub Actions workflow.
- Produces: a publicly verified Cloudflare Pages deployment.

- [ ] **Step 1: Run source gate**

~~~powershell
node tests/site.test.mjs
node --check script.js
git diff --check
git status --short --branch
~~~

Expected: tests pass, JavaScript is valid and no unrelated untracked file is staged.

- [ ] **Step 2: Check desktop and mobile layout**

At 1440 × 900, verify product-first hero, matched ANC scene, no person in spatial audio, and the acoustic proof as the only bright chapter.

At 390 × 844 and 430 × 932, execute:

~~~js
const copy = document.querySelector('.hero-copy').getBoundingClientRect();
const product = document.querySelector('.product-stage-hero').getBoundingClientRect();
({
  copyAboveProduct: product.top >= copy.bottom,
  noHorizontalOverflow: document.documentElement.scrollWidth === document.documentElement.clientWidth,
});
~~~

Expected: { copyAboveProduct: true, noHorizontalOverflow: true } at both widths. Also check mobile menu order and 44px listening-mode targets.

- [ ] **Step 3: Exercise interactions**

~~~text
1. Open the mobile menu and click 音质; the menu closes and the URL hash becomes #sound-engineering.
2. Click 通透模式; aria-pressed, title, description and visible scene change together.
3. Click 降噪开启; all four state values return together.
4. Enable reduced motion; content remains visible and no long transition continues.
~~~

- [ ] **Step 4: Push and verify Pages**

~~~powershell
git push origin main
git log -1 --oneline
git status --short --branch
~~~

Wait for the Test and deploy Vela One workflow. Then visit https://vela-one-mobile.pages.dev/ anonymously and repeat the phone menu, sound anchor, mode-switch and image-resource checks.

## Self-Review Result

- Spec coverage: every psychological stage, anonymous visual rule, technical proof, mobile behavior, reduced motion and public verification has a task.
- Placeholder scan: no unresolved task, undefined selector or vague source file remains.
- Scope check: existing static architecture is retained; three assets are the smallest addition that removes face-led scenes without breaking product continuity.
- Simplicity check: no framework, library, custom renderer, canvas, video or new deployment mechanism is introduced.
