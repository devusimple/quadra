import { st } from './state.js';

/** Build a QR matrix for `text` at the current error-correction level. */
export function makeQR(text) {
  const q = window.qrcode(0, st.ecc);
  q.addData(text);
  q.make();
  return q;
}

/**
 * Render a QR matrix as an SVG string.
 * @param {{getModuleCount():number,isDark(r:number,c:number):boolean}} q
 * @param {number|null} px fixed width/height when exporting, else responsive
 */
export function toSVG(q, px) {
  const n = q.getModuleCount();
  const m = st.margin;
  const t = n + 2 * m;
  const sq = st.shape === 'square';
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isFinder(r, c) || !q.isDark(r, c)) continue;
      const x = c + m;
      const y = r + m;
      if (st.shape === 'dots') {
        d += `M${x + 0.08} ${y + 0.5}a.42 .42 0 1 0 .84 0a.42 .42 0 1 0 -.84 0`;
      } else if (st.shape === 'rounded') {
        d +=
          `M${x + 0.3} ${y}h.4a.3 .3 0 0 1 .3 .3v.4a.3 .3 0 0 1 -.3 .3` +
          `h-.4a.3 .3 0 0 1 -.3 -.3v-.4a.3 .3 0 0 1 .3 -.3z`;
      } else {
        d += `M${x} ${y}h1v1h-1z`;
      }
    }
  }

  const ro = sq ? 0 : st.shape === 'rounded' ? 1.4 : 2.6;
  const ri = sq ? 0 : st.shape === 'rounded' ? 0.8 : 1.5;
  let f = '';
  for (const [fr, fc] of [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]) {
    const x = fc + m;
    const y = fr + m;
    f +=
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="${ro}" ` +
      `fill="none" stroke="${st.fg}" stroke-width="1"/>` +
      `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${ri}" fill="${st.fg}"/>`;
  }

  const sizeAttr = px ? ` width="${px}" height="${px}"` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}"` +
    `${sizeAttr}${sq ? ' shape-rendering="crispEdges"' : ''} aria-hidden="true" focusable="false">` +
    `<rect width="${t}" height="${t}" fill="${st.bg}"/>` +
    `<path d="${d}" fill="${st.fg}"/>${f}</svg>`
  );
}

/** Relative luminance of a #rrggbb color, for contrast advisories. */
export function luminance(hex) {
  const v = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
