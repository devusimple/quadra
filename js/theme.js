import { storeGet, storeSet } from './utils.js';

const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

const root = document.documentElement;
const mq = window.matchMedia('(prefers-color-scheme:dark)');

export function isDark() {
  return root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches;
}

function paintThemeBtn() {
  const b = document.getElementById('theme');
  if (!b) return;
  const dark = isDark();
  b.setAttribute('aria-pressed', String(dark));
  b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  b.innerHTML = dark ? ICON_SUN : ICON_MOON;
}

/** Syncs the toggle with the stored/system theme and wires the click handler. */
export function initTheme() {
  const saved = storeGet('quadra-theme');
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  paintThemeBtn();
  if (mq.addEventListener) {
    mq.addEventListener('change', () => {
      if (!root.dataset.theme) paintThemeBtn();
    });
  }
  document.getElementById('theme').addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    storeSet('quadra-theme', root.dataset.theme);
    paintThemeBtn();
  });
}
