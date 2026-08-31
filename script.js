const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.site-nav a');
const reveals = document.querySelectorAll('.reveal');
const year = document.querySelector('#year');
const scrollScaleElements = document.querySelectorAll('[data-scroll-scale]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const noiseExperience = document.querySelector('.noise-experience');
const noiseModeButtons = document.querySelectorAll('[data-noise-mode]');
const noiseTitle = document.querySelector('[data-noise-title]');
const noiseDescription = document.querySelector('[data-noise-description]');
const noiseContent = {
  anc: {
    title: '世界安静下来',
    description: '地铁、人群与轨道声逐渐退后，只留下你正在聆听的声音。',
  },
  transparency: {
    title: '重要的声音重新靠近',
    description: '无需摘下耳机，也能自然听见对话、广播与身边的环境提醒。',
  },
};

function setNoiseMode(mode) {
  const content = noiseContent[mode];
  if (!noiseExperience || !content) return;
  noiseExperience.dataset.mode = mode;
  noiseModeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.noiseMode === mode));
  });
  if (noiseTitle) noiseTitle.textContent = content.title;
  if (noiseDescription) noiseDescription.textContent = content.description;
}

noiseModeButtons.forEach((button) => {
  button.addEventListener('click', () => setNoiseMode(button.dataset.noiseMode));
});

function setMenuState(open) {
  siteNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '关闭' : '菜单';
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    setMenuState(!siteNav.classList.contains('is-open'));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });
}

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (year) {
  year.textContent = new Date().getFullYear();
}

let scrollFrame = 0;

function updateScrollScale() {
  scrollFrame = 0;
  const viewportHeight = window.innerHeight;

  scrollScaleElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > viewportHeight) return;

    const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
    element.style.setProperty('--scroll-progress', progress.toFixed(3));
  });
}

function requestScrollScaleUpdate() {
  if (scrollFrame || prefersReducedMotion.matches) return;
  scrollFrame = requestAnimationFrame(updateScrollScale);
}

if (!prefersReducedMotion.matches && scrollScaleElements.length) {
  updateScrollScale();
  window.addEventListener('scroll', requestScrollScaleUpdate, { passive: true });
  window.addEventListener('resize', requestScrollScaleUpdate);
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  document.documentElement.classList.add('js-enabled');
  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}
