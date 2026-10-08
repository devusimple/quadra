import { session, st } from './state.js';
import { toSVG } from './qr-svg.js';
import { $ } from './utils.js';

let toastTimer = null;

/** Transient bottom toast. */
export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = '0';
  }, 2400);
}

function anchorDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function save(blob, name) {
  anchorDownload(blob, name);
  toast(`Downloading ${name}`);
}

/** Rasterise the current QR SVG to a PNG blob at the selected size. */
export function pngBlob() {
  return new Promise((resolve, reject) => {
    if (!session.current) {
      reject(new Error('nothing to export'));
      return;
    }
    const units = session.current.q.getModuleCount() + 2 * st.margin;
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = st.size;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        // Snap each module to a whole number of pixels so edges stay sharp,
        // then centre the code and fill the leftover border with the background.
        const inner = Math.floor(st.size / units) * units;
        const off = Math.floor((st.size - inner) / 2);
        ctx.fillStyle = st.bg;
        ctx.fillRect(0, 0, st.size, st.size);
        ctx.drawImage(img, off, off, inner, inner);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('svg rasterisation failed'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(toSVG(session.current.q, st.size))}`;
  });
}

function downloadPng() {
  if (!session.current) return;
  pngBlob()
    .then((blob) => save(blob, 'qr-code.png'))
    .catch(() => toast('Could not create the PNG. Try a smaller size.'));
}

function downloadSvg() {
  if (!session.current) return;
  try {
    save(new Blob([toSVG(session.current.q, st.size)], { type: 'image/svg+xml' }), 'qr-code.svg');
  } catch {
    toast('Could not create the SVG.');
  }
}

async function copyImage() {
  if (!session.current) return;
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    toast('Copying is not available here. Use Download PNG instead.');
    return;
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob() })]);
    toast('Image copied');
  } catch {
    toast('Copying is not available here. Use Download PNG instead.');
  }
}

/** Wires the three export buttons in the preview plate. */
export function initExport() {
  $('#dlPng').addEventListener('click', downloadPng);
  $('#dlSvg').addEventListener('click', downloadSvg);
  $('#copy').addEventListener('click', copyImage);
}
