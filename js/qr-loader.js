/**
 * Loads the `qrcode-generator` library without blocking first paint.
 * Tries a same-origin copy first, then pinned CDN fallbacks (SRI).
 * Resolves once `window.qrcode` is available.
 */
export const qrReady = new Promise((resolve, reject) => {
  // SRI matches qrcode-generator@1.4.4/qrcode.js exactly.
  const SRI = 'sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k';
  const urls = [
    '/vendor/qrcode.js',
    'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.js',
    'https://unpkg.com/qrcode-generator@1.4.4/qrcode.js',
  ];

  let i = 0;
  function next() {
    if (i >= urls.length) {
      reject(new Error('qr-library-unavailable'));
      return;
    }
    const src = urls[i++];
    const s = document.createElement('script');
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      s.remove();
      next();
    }, 8000);

    if (/^https:/.test(src)) {
      s.integrity = SRI;
      s.crossOrigin = 'anonymous';
    }
    s.src = src;
    s.async = true;
    s.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (window.qrcode) resolve();
      else next();
    };
    s.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      s.remove();
      next();
    };
    document.head.appendChild(s);
  }
  next();
});
