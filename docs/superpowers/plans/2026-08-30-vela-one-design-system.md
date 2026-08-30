# Vela One 设计系统页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增可公开访问的 Vela One 设计系统页面，展示可访问的颜色、字体、间距和组件规范，并支持明暗模式。

**Architecture:** 使用原生 HTML、CSS 和 JavaScript 新增独立静态页面。页面专用 CSS 采用 `ds-` 前缀 BEM class 与 CSS token；主题脚本只负责系统偏好、手动切换和本地记忆。现有产品页仅同步更新强调蓝 token，GitHub Actions 复制新文件到 Cloudflare Pages。

**Tech Stack:** HTML5、CSS Custom Properties、原生 JavaScript、Node.js 内置 `node:test`、GitHub Actions、Cloudflare Pages。

**Spec:** `docs/superpowers/specs/2026-08-30-vela-one-design-system-design.md`

## Global Constraints

- 不新增第三方库、构建工具、后端或产品首页导航入口。
- 固定新增 `design-system.html`、`design-system.css`、`design-system.js`。
- CSS class 使用 `ds-` 前缀的 BEM 命名。
- 强调蓝固定为 `#4A9EDD`，Accent 背景上的文字使用 Ink。
- 主题手动选择写入 `localStorage`；可交互控件最小高度 44px。
- 最终必须通过原有测试、设计系统测试、GitHub Actions 和手机/桌面浏览器检查。

---

### Task 1: 为设计系统页定义失败检查

**Files:**
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: 现有 `read(file)` 辅助函数。
- Produces: `design-system page exposes required tokens, sections, and accessible theme controls` 测试。

- [ ] **Step 1: 在测试文件末尾加入失败测试**

```js
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
    '.ds-color-card', '.ds-color-card__swatch', '.ds-button--primary',
    '.ds-button--secondary', '.ds-card--large', '.ds-nav--expanded',
    '@media (min-width: 720px)', 'prefers-reduced-motion', ':focus-visible',
  ]) assert.ok(css.includes(value), `design CSS should include ${value}`);

  for (const value of ['localStorage', 'prefers-color-scheme', 'aria-pressed', 'dataset.theme']) {
    assert.ok(script.includes(value), `theme script should include ${value}`);
  }
  assert.match(siteCss, /--accent:\s*#4a9edd;/i);
});
```

- [ ] **Step 2: 运行测试，确认新测试失败**

Run: `node tests/site.test.mjs`

Expected: 新测试因缺少 `design-system.html` 失败，其余测试通过。

- [ ] **Step 3: 提交测试**

```powershell
git add tests/site.test.mjs
git commit -m "test: define design system page requirements"
```

### Task 2: 实现独立页面、token 和明暗主题

**Files:**
- Create: `design-system.html`
- Create: `design-system.css`
- Create: `design-system.js`
- Modify: `styles.css:1-9`

**Interfaces:**
- Consumes: Task 1 测试；根元素的 `data-theme`。
- Produces: `#theme-toggle` 按钮和 `vela-one-design-system-theme` 本地存储项。

- [ ] **Step 1: 创建 HTML 骨架与四个区块**

创建头部、色彩、字体、间距、组件四区。每个 section 前加入中文 HTML 注释，说明设计目的。

```html
<header class="ds-header">
  <a class="ds-header__brand" href="index.html">Vela One</a>
  <button class="ds-theme-toggle" id="theme-toggle" type="button" aria-pressed="false">
    切换到深色模式
  </button>
</header>
<main class="ds-main">
  <section class="ds-section" id="color"><h2>色彩系统</h2></section>
  <section class="ds-section" id="type"><h2>字体层级</h2></section>
  <section class="ds-section" id="spacing"><h2>间距系统</h2></section>
  <section class="ds-section" id="components"><h2>组件库</h2></section>
</main>
```

色彩区创建 6 张卡：每张有 100px 色块、HEX、RGB、HSL、用途、白/黑对比度。Accent 加可见提示“配 Ink 文字；白色小字不合格”。字体区显示 H1、H2、Body、Caption 的完整 CSS 值。间距区显示 4、8、16、24、32、48、64、96px 的真实宽度条。组件区展示主要/次要/禁用按钮、大/小卖点卡、展开/收起导航，并在每类下面添加 `<pre><code>` 最小 HTML 示例。

- [ ] **Step 2: 编写移动端优先 CSS**

在 `design-system.css` 顶部定义：

```css
:root {
  --ds-ink: #0b0e12;
  --ds-muted: #66717a;
  --ds-ice: #edf1f3;
  --ds-graphite: #0e1217;
  --ds-accent: #4a9edd;
  --ds-paper: #fbfcfc;
  --ds-space-1: 4px;
  --ds-space-2: 8px;
  --ds-space-3: 16px;
  --ds-space-4: 24px;
  --ds-space-5: 32px;
  --ds-space-6: 48px;
  --ds-space-7: 64px;
  --ds-space-8: 96px;
  --ds-touch-target: 44px;
}
```

默认单列，在 `@media (min-width: 720px)` 使用网格。所有 class 使用 `ds-` BEM 名称；加入 `:focus-visible`、禁用态、悬停态和 `prefers-reduced-motion`。深色 token 使用 `:root[data-theme="dark"]`，并用系统深色偏好规则处理未手动选择的首次访问。

- [ ] **Step 3: 写入最小主题脚本**

```js
const root = document.documentElement;
const button = document.querySelector('#theme-toggle');
const storageKey = 'vela-one-design-system-theme';
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
  const dark = theme === 'dark';
  button.setAttribute('aria-pressed', String(dark));
  button.textContent = dark ? '切换到浅色模式' : '切换到深色模式';
}

setTheme(localStorage.getItem(storageKey) || preferredTheme);
button.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
```

- [ ] **Step 4: 同步产品页强调蓝**

将 `styles.css` 根 token 改为：

```css
--accent: #4a9edd;
```

不改产品页布局、图片或文案。

- [ ] **Step 5: 运行测试并提交实现**

Run: `node tests/site.test.mjs`

Expected: 原有测试与设计系统测试均通过。

```powershell
git add design-system.html design-system.css design-system.js styles.css tests/site.test.mjs
git commit -m "feat: add Vela One design system page"
```

### Task 3: 让 Cloudflare 自动部署新页面并最终验证

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: 三个 `design-system.*` 文件。
- Produces: 公网地址 `/design-system.html`。

- [ ] **Step 1: 加入部署产物失败检查**

```js
test('deployment workflow copies the design-system files', async () => {
  const workflow = await read('.github/workflows/deploy.yml');
  for (const file of ['design-system.html', 'design-system.css', 'design-system.js']) {
    assert.ok(workflow.includes(file), `deployment workflow should copy ${file}`);
  }
});
```

- [ ] **Step 2: 运行测试，确认检查失败**

Run: `node tests/site.test.mjs`

Expected: 新测试因工作流尚未复制设计系统文件而失败。

- [ ] **Step 3: 更新 Actions 复制命令**

在 `.github/workflows/deploy.yml` 将构建命令改为：

```yaml
mkdir -p dist
cp index.html styles.css script.js design-system.html design-system.css design-system.js dist/
cp -R assets dist/assets
```

保留原测试命令、Cloudflare 项目名、密钥名称和 `main` 分支。

- [ ] **Step 4: 完整测试与静态检查**

Run: `node tests/site.test.mjs`

Expected: 全部通过。

Run: `git diff --check HEAD~1..HEAD`

Expected: 没有空白错误。

- [ ] **Step 5: 进行 390px 和桌面浏览器检查**

确认 6 色卡、4 级字体、8 种间距、3 类组件和代码示例都可见；主题切换后刷新仍保留；按钮可键盘聚焦；禁用按钮不可点击；页面没有横向滚动；产品首页仍可正常加载且强调蓝更新。

- [ ] **Step 6: 提交、推送并检查 Actions**

```powershell
git add .github/workflows/deploy.yml tests/site.test.mjs
git commit -m "ci: deploy Vela One design system page"
git push origin main
```

GitHub Actions 绿色通过后访问：

```text
https://vela-one-mobile.pages.dev/design-system.html
```

## 自检结果

- 五个页面区、六色 token、四级字体、八级间距、三类组件、BEM、主题、响应式、代码示例、可访问性和部署均已有对应任务。
- 部署复制步骤被单独验证，避免新页面只存在于源码、没有出现在公网。
- 已检查本文档不存在 TBD、TODO 或未定义实现占位。
