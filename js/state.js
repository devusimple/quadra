import { wesc } from './utils.js';

/**
 * Content types, user selections, and per-type field values.
 * `st` / `vals` are mutated in place; importers see live updates.
 */

export const TYPES = {
  url: {
    label: 'Link',
    fields: [
      { k: 'url', label: 'Web address', ph: 'example.com/menu', type: 'url', im: 'url', ac: 'url' },
    ],
    build(v) {
      const u = (v.url || '').trim();
      // A scheme is "name:" not followed by a digit, so "example.com:8080" and
      // "localhost:3000" are read as host:port and still get https:// prepended.
      return u && !/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(u) ? `https://${u}` : u;
    },
    check(text) {
      return /^https?:\/\/[^\s/?#]/i.test(text)
        ? ''
        : 'Links must be a web address starting with http:// or https://.';
    },
  },
  text: {
    label: 'Text',
    fields: [{ k: 'text', label: 'Message', ph: 'Anything you want people to read', area: true }],
    build(v) {
      return v.text || '';
    },
  },
  wifi: {
    label: 'Wi-Fi',
    fields: [
      { k: 'ssid', label: 'Network name', ph: 'Home network', ac: 'off' },
      { k: 'pass', label: 'Password', ph: 'Leave empty for open networks', ac: 'off' },
      {
        k: 'sec',
        label: 'Security',
        sel: [
          ['WPA', 'WPA / WPA2 / WPA3'],
          ['WEP', 'WEP'],
          ['nopass', 'None'],
        ],
      },
      {
        k: 'hid',
        label: 'Hidden network',
        sel: [
          ['', 'No, it is visible'],
          ['true', 'Yes, it is hidden'],
        ],
      },
    ],
    build(v) {
      if (!(v.ssid || '').trim()) return '';
      const t = v.sec || 'WPA';
      return (
        `WIFI:T:${t};S:${wesc(v.ssid)};` +
        (t === 'nopass' ? '' : `P:${wesc(v.pass || '')};`) +
        (v.hid === 'true' ? 'H:true;' : '') +
        ';'
      );
    },
  },
  email: {
    label: 'Email',
    fields: [
      { k: 'to', label: 'Send to', ph: 'name@example.com', type: 'email', im: 'email', ac: 'email' },
      { k: 'sub', label: 'Subject', ph: 'Optional' },
      { k: 'body', label: 'Message', ph: 'Optional', area: true },
    ],
    build(v) {
      if (!(v.to || '').trim()) return '';
      const p = [];
      if ((v.sub || '').trim()) p.push(`subject=${encodeURIComponent(v.sub.trim())}`);
      if ((v.body || '').trim()) p.push(`body=${encodeURIComponent(v.body.trim())}`);
      return `mailto:${v.to.trim()}${p.length ? `?${p.join('&')}` : ''}`;
    },
  },
  phone: {
    label: 'Phone',
    fields: [
      { k: 'num', label: 'Phone number', ph: '+1 555 010 0199', type: 'tel', im: 'tel', ac: 'tel' },
    ],
    build(v) {
      const n = (v.num || '').trim();
      return n ? `tel:${n.replace(/[^\d+]/g, '')}` : '';
    },
  },
};

export const st = {
  type: 'url',
  shape: 'rounded',
  fg: '#0F1B3D',
  bg: '#FFFFFF',
  ecc: 'M',
  margin: 2,
  size: 1024,
};

export const vals = {
  url: {},
  text: {},
  wifi: { sec: 'WPA' },
  email: {},
  phone: {},
};

/** Render session: holds the last successfully built QR payload, if any. */
export const session = { current: null };
