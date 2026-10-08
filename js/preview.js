import { TYPES, session, st, vals } from './state.js';
import { makeQR, toSVG, luminance } from './qr-svg.js';
import { $, debounce } from './utils.js';

const BLANK = '\u00a0';

/**
 * Renders the preview, meta line, advisories, and export-button state
 * for the current content + style selection.
 */
export function render() {
  if (!window.qrcode) return;

  const text = TYPES[st.type].build(vals[st.type]);
  const isEmpty = !text.trim();
  const invalid = !isEmpty && TYPES[st.type].check ? TYPES[st.type].check(text) : '';
  let msg = '';
  const preview = $('#preview');
  const emptyEl = $('#empty');

  try {
    const q = makeQR(isEmpty || invalid ? 'quadra' : text);
    session.current = isEmpty || invalid ? null : { q, text };
    preview.innerHTML = toSVG(q, null);
    preview.style.opacity = session.current ? '1' : '.14';

    const n = q.getModuleCount();
    const total = n + 2 * st.margin;
    $('#meta').textContent = !session.current
      ? BLANK
      : `${n} × ${n} modules · ECC ${st.ecc}` +
        (st.margin ? ` · ${total} × ${total} with margin` : '');
  } catch {
    session.current = null;
    try {
      preview.innerHTML = toSVG(makeQR('quadra'), null);
      preview.style.opacity = '.14';
    } catch {
      preview.innerHTML = '';
    }
    msg = 'Too much data for one QR code. Shorten the content or lower the error correction level.';
  }

  // Empty / error overlay — always readable, in both themes.
  if (isEmpty) {
    emptyEl.textContent = 'Enter something on the left and your code appears here.';
    emptyEl.style.display = 'grid';
    $('#meta').textContent = BLANK;
  } else if (invalid) {
    emptyEl.textContent = invalid;
    emptyEl.style.display = 'grid';
    $('#meta').textContent = BLANK;
  } else if (!session.current) {
    emptyEl.textContent = 'Too much data — shorten it or lower error correction.';
    emptyEl.style.display = 'grid';
    $('#meta').textContent = BLANK;
  } else {
    emptyEl.style.display = 'none';
  }

  // Contrast / inversion advisory
  if (!msg && session.current) {
    const a = luminance(st.fg);
    const b = luminance(st.bg);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < 3) {
      msg = 'Low contrast between the code and background. Some scanners may not read it.';
    } else if (a > b) {
      msg = 'The code is lighter than its background. Some older scanners cannot read inverted codes.';
    }
  }

  const warn = $('#warn');
  warn.textContent = msg;
  warn.classList.toggle('hidden', !msg);

  for (const s of ['#dlPng', '#dlSvg', '#copy']) $(s).disabled = !session.current;
}

export const scheduleRender = debounce(render, 90);
