import { TYPES, st, vals } from './state.js';
import { $, esc } from './utils.js';

export const ECC_LEVELS = ['L', 'M', 'Q', 'H'];
export const ECC_LABELS = { L: 'Low', M: 'Medium', Q: 'Quartile', H: 'High' };
export const SIZES = [512, 1024, 2048];
export const SHAPES = [
  ['square', 'Square'],
  ['rounded', 'Rounded'],
  ['dots', 'Dots'],
];

const PRESETS = [
  ['#0F1B3D', '#FFFFFF', 'Navy on white'],
  ['#0B5D4B', '#EEF8F3', 'Green on mint'],
  ['#7A1F5C', '#FFF3FA', 'Plum on blush'],
  ['#1F3FD1', '#EEF1FF', 'Blue on periwinkle'],
  ['#000000', '#FFFFFF', 'Black on white'],
];

export function drawTabs() {
  $('#tabs').innerHTML = Object.keys(TYPES)
    .map((k) => {
      const on = k === st.type;
      return (
        `<button type="button" role="tab" data-k="${k}" aria-selected="${on}" ` +
        `tabindex="${on ? '0' : '-1'}">${TYPES[k].label}</button>`
      );
    })
    .join('');
}

export function drawFields() {
  const t = TYPES[st.type];
  const v = vals[st.type];
  $('#fields').innerHTML = t.fields
    .map((f) => {
      const id = `f-${f.k}`;
      const val = esc(v[f.k] || '');
      const extra =
        (f.im ? ` inputmode="${f.im}"` : '') +
        (f.ac ? ` autocomplete="${f.ac}"` : ' autocomplete="off"') +
        (f.type === 'url' ? ' autocapitalize="off" spellcheck="false"' : '');
      let ctrl;
      if (f.sel) {
        const current = v[f.k] ?? f.sel[0][0];
        ctrl =
          `<select id="${id}" data-k="${f.k}" class="field">` +
          f.sel
            .map(
              ([value, label]) =>
                `<option value="${value}"${current === value ? ' selected' : ''}>${label}</option>`,
            )
            .join('') +
          '</select>';
      } else if (f.area) {
        ctrl =
          `<textarea id="${id}" data-k="${f.k}" class="field" ` +
          `placeholder="${esc(f.ph)}"${extra}>${val}</textarea>`;
      } else {
        ctrl =
          `<input id="${id}" data-k="${f.k}" class="field" type="${f.type || 'text'}" ` +
          `placeholder="${esc(f.ph)}" value="${val}"${extra}>`;
      }
      return `<div><label for="${id}" class="lbl">${f.label}</label>${ctrl}</div>`;
    })
    .join('');
}

function glyph(shape) {
  const pts = [
    [2, 2],
    [18, 2],
    [2, 18],
    [18, 18],
  ];
  const body = pts
    .map(([x, y]) =>
      shape === 'dots'
        ? `<circle cx="${x + 7}" cy="${y + 7}" r="6.5"/>`
        : `<rect x="${x}" y="${y}" width="14" height="14" rx="${shape === 'rounded' ? 5 : 0}"/>`,
    )
    .join('');
  return `<svg viewBox="0 0 34 34" fill="currentColor" aria-hidden="true">${body}</svg>`;
}

export function drawShapes() {
  $('#shapes').innerHTML = SHAPES.map(([value, label]) => {
    const on = st.shape === value;
    return (
      `<button type="button" class="opt" data-s="${value}" aria-pressed="${on}" ` +
      `tabindex="${on ? '0' : '-1'}">${glyph(value)}${label}</button>`
    );
  }).join('');
}

function drawSeg(selector, items, active, fmt) {
  $(selector).innerHTML = items
    .map((item) => {
      const on = active === item;
      return (
        `<button type="button" data-v="${item}" aria-pressed="${on}" ` +
        `tabindex="${on ? '0' : '-1'}">${fmt ? fmt(item) : item}</button>`
      );
    })
    .join('');
}

export function drawEccSeg() {
  drawSeg('#eccs', ECC_LEVELS, st.ecc, (x) => ECC_LABELS[x]);
}

export function drawSizeSeg() {
  drawSeg('#sizes', SIZES, st.size, (x) => `${x} px`);
}

export function drawPresets() {
  $('#presets').innerHTML = PRESETS.map(([fg, bg, name], i) => {
    const on =
      st.fg.toLowerCase() === fg.toLowerCase() && st.bg.toLowerCase() === bg.toLowerCase();
    return (
      `<button type="button" class="swatch" data-i="${i}" title="${name}" ` +
      `aria-label="${name}" aria-pressed="${on}" style="background:${bg}">` +
      `<i style="background:${fg}"></i></button>`
    );
  }).join('');
}

export function syncColors() {
  $('#fg').value = st.fg;
  $('#bg').value = st.bg;
  $('#fgv').textContent = st.fg.toUpperCase();
  $('#bgv').textContent = st.bg.toUpperCase();
  $('#fg').parentElement.style.background = st.fg;
  $('#bg').parentElement.style.background = st.bg;
  drawPresets();
}

/** Roving-tabindex arrow-key navigation shared by all segmented controls. */
export function segKeys(container) {
  container.addEventListener('keydown', (e) => {
    const btns = Array.prototype.slice.call(container.querySelectorAll('button:not(:disabled)'));
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % btns.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = btns.length - 1;
    if (j === null) return;
    e.preventDefault();
    btns[j].focus();
    btns[j].click();
  });
}

export function getPreset(i) {
  return PRESETS[i];
}
