/** Shared DOM + string helpers. Pure, no app state. */

export const $ = (selector, root = document) => root.querySelector(selector);

export const $$ = (selector, root = document) =>
  Array.prototype.slice.call(root.querySelectorAll(selector));

export function esc(value) {
  return String(value).replace(/[&<>"]/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return '&quot;';
    }
  });
}

/** Escape Wi-Fi field separators per the WIFI: URI scheme. */
export function wesc(value) {
  return String(value).replace(/([\\;,:"])/g, '\\$1');
}

export function storeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storeSet(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, blocked) — theme just won't persist */
  }
}

/** Trailing-edge debounce for input-driven re-renders. */
export function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
