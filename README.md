# Vela One

[![GitHub Actions](https://github.com/yxiao5210-lgtm/vela-one/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/yxiao5210-lgtm/vela-one/actions/workflows/deploy.yml)
[![License: Not specified](https://img.shields.io/badge/license-not%20specified-lightgrey)](#license)
[![Cloudflare Pages](https://img.shields.io/badge/deploy-Cloudflare%20Pages-F38020)](https://vela-one-mobile.pages.dev/)

> 一个以“静下来，听见更多”为主题的冰银无线耳机产品故事网站。

## 在线 Demo

[https://vela-one-mobile.pages.dev/](https://vela-one-mobile.pages.dev/)

## 项目特点

- 以产品故事而非参数堆砌建立“安静、专注、有品位”的品牌感受。
- 提供降噪开启与通透模式切换，直观对比两种聆听体验。
- 包含音质、空间音频、佩戴和续航等完整商品详情页结构。
- 使用响应式布局，覆盖电脑、平板与手机浏览场景。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- Node.js 内置测试运行器
- GitHub Actions
- Cloudflare Pages

## 快速开始

### 前置条件

- Node.js 20 或更高版本，用于运行测试。
- Git，用于版本管理。
- Python 3（可选），用于启动本地静态服务器。

### 克隆并进入项目

```bash
git clone <你的 GitHub 仓库地址>
cd <仓库目录>
```

### 本地预览

直接打开 `index.html` 即可查看静态页面。若需要通过本地服务器预览：

```bash
python -m http.server 8080
```

随后访问 [http://localhost:8080](http://localhost:8080)。

## 项目结构

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml       # 推送 main 后的测试与 Cloudflare Pages 部署
├── assets/                  # 产品图、场景图与认证徽标
├── tests/
│   └── site.test.mjs        # 页面结构与资源测试
├── index.html               # 页面结构与产品文案
├── styles.css               # 视觉系统与响应式布局
├── script.js                # 菜单、动效与降噪模式切换
├── .gitignore               # 不提交的本地和构建文件
└── README.md
```

## 测试

运行完整测试：

```bash
node tests/site.test.mjs
```

## 部署到 Cloudflare Pages

### 一次性准备

1. 在 Cloudflare 创建名为 `vela-one-mobile` 的 Pages 项目。
2. 创建具备 Pages 编辑权限的 Cloudflare API Token。
3. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. 推送后可在仓库的 **Actions** 页面查看测试与部署记录。

### 自动部署

将修改推送到 `main`：

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

GitHub Actions 会先运行测试；只有测试通过后，才会生成 `dist` 并部署到 Cloudflare Pages。

### 本地手动部署（PowerShell）

```powershell
New-Item -ItemType Directory -Force dist
Copy-Item index.html, styles.css, script.js dist
Copy-Item -Recurse -Force assets dist\assets
npx wrangler pages deploy dist --project-name vela-one-mobile --branch main
```

## License

当前项目尚未声明许可证。发布公开仓库或允许他人复用前，请由项目所有者选择并添加合适的 `LICENSE` 文件。
