const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('.site-nav a');
const reveals = document.querySelectorAll('.reveal');
const year = document.querySelector('#year');
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
    description: '无需摘下耳机，也能自然听见对话、广播和身边的环境提示。',
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

  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}
