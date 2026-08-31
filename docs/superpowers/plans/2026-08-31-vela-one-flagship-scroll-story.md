# Vela One Flagship Scroll Story Implementation Plan

**Goal:** 把现有页面改成产品占主导、全屏递进、具有发布片冲击力的旗舰耳机故事页。

**Architecture:** 保留静态 HTML、CSS 与原生 JavaScript，复用现有产品素材；把小卡片总览替换为全屏章节索引，并用 CSS 变量和一个轻量滚动监听驱动产品缩放。导航、降噪切换、无 JavaScript 可读性和减少动态效果保持不变。

## Tasks

- [x] 用失败测试定义大产品首屏、全屏第二屏、章节索引和空间音频视觉钩子。
- [x] 重构 `index.html`，让首屏、第二屏、降噪、音质、空间音频和规格形成连续全屏故事。
- [x] 重构 `styles.css`，放大关键产品、建立桌面与手机端独立构图，并保留可访问性状态。
- [x] 在 `script.js` 中用 `requestAnimationFrame` 和 CSS 变量实现轻量滚动尺度变化。
- [x] 验证 390px、430px、桌面端、降噪切换、控制台、自动化测试与差异格式。
