import { qrReady } from './qr-loader.js';
import { initTheme } from './theme.js';
import { st, vals } from './state.js';
import { render, scheduleRender } from './preview.js';
import {
  drawEccSeg,
  drawFields,
  drawShapes,
  drawSizeSeg,
  drawTabs,
  getPreset,
  segKeys,
  syncColors,
} from './ui.js';
import { initExport } from './export.js';
import { $ } from './utils.js';

function boot() {
  window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8'];

  drawTabs();
  drawFields();
  drawShapes();
  drawEccSeg();
  drawSizeSeg();
  syncColors();
  render();

  for (const s of ['#tabs', '#shapes', '#eccs', '#sizes', '#presets']) segKeys($(s));

  // Content type tabs
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    st.type = b.dataset.k;
    drawTabs();
    drawFields();
    render();
    const f = $('#fields input, #fields textarea, #fields select');
    if (f && window.matchMedia('(min-width:1024px)').matches) f.focus();
  });

  // Field input (debounced preview) + change (immediate, for selects)
  $('#fields').addEventListener('input', (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    vals[st.type][k] = e.target.value;
    scheduleRender();
  });
  $('#fields').addEventListener('change', (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    vals[st.type][k] = e.target.value;
    render();
  });

  // Style controls
  $('#shapes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    st.shape = b.dataset.s;
    drawShapes();
    render();
  });

  $('#eccs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    st.ecc = b.dataset.v;
    drawEccSeg();
    render();
  });

  $('#sizes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    st.size = +b.dataset.v;
    drawSizeSeg();
  });

  $('#fg').addEventListener('input', (e) => {
    st.fg = e.target.value;
    syncColors();
    scheduleRender();
  });
  $('#bg').addEventListener('input', (e) => {
    st.bg = e.target.value;
    syncColors();
    scheduleRender();
  });

  $('#presets').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const p = getPreset(+b.dataset.i);
    st.fg = p[0];
    st.bg = p[1];
    syncColors();
    render();
  });

  $('#margin').addEventListener('input', (e) => {
    st.margin = +e.target.value;
    $('#mv').textContent = `${st.margin}${st.margin === 1 ? ' module' : ' modules'}`;
    scheduleRender();
  });

  initExport();
}

function fail() {
  const empty = document.getElementById('empty');
  empty.textContent = 'The QR library could not load. Check your connection and reload.';
  empty.style.display = 'grid';
  document.getElementById('preview').innerHTML = '';
  for (const id of ['dlPng', 'dlSvg', 'copy']) {
    const b = document.getElementById(id);
    if (b) b.disabled = true;
  }
}

initTheme();
qrReady.then(boot).catch(fail);
