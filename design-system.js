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
button.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});
