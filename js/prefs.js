/* prefs.js — theme, accent and wallpaper preferences.
   Single source of truth, persisted, applied by mutating CSS custom properties. */

const LS_KEY = 'clintos.prefs.v1';

export const ACCENTS = [
  { id: 'blue',   label: 'Default blue', light: '#0067C0', dark: '#4CC2FF' },
  { id: 'teal',   label: 'Teal',         light: '#00808C', dark: '#4FD8E8' },
  { id: 'violet', label: 'Violet',       light: '#6B4EE6', dark: '#B4A0FF' },
  { id: 'rose',   label: 'Rose',         light: '#C2185B', dark: '#FF9EC4' },
  { id: 'amber',  label: 'Amber',        light: '#9A5B00', dark: '#FFC55C' },
  { id: 'green',  label: 'Green',        light: '#0F7B37', dark: '#6BD98F' },
];

export const WALLPAPERS = [
  { id: 'bloom', label: 'Bloom' },
  { id: 'mesh',  label: 'Mesh' },
  { id: 'mono',  label: 'Mono' },
];

const DEFAULTS = { theme: 'auto', accent: 'blue', wallpaper: 'bloom' };

let prefs = { ...DEFAULTS };
const subs = new Set();

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (raw && typeof raw === 'object') return { ...DEFAULTS, ...raw };
  } catch (err) { /* ignore */ }
  return { ...DEFAULTS };
}

function write() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(prefs)); } catch (err) { /* ignore */ }
}

function effectiveDark() {
  if (prefs.theme === 'dark') return true;
  if (prefs.theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function apply() {
  const root = document.documentElement;

  if (prefs.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', prefs.theme);

  const a = ACCENTS.find(x => x.id === prefs.accent) || ACCENTS[0];
  const hex = effectiveDark() ? a.dark : a.light;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hover', hex);
  root.style.setProperty('--accent-pressed', hex);
  root.style.setProperty('--accent-text', effectiveDark() ? '#001A26' : '#FFFFFF');

  document.body.dataset.wallpaper = prefs.wallpaper;
  subs.forEach(fn => fn(prefs));
}

export function get() { return { ...prefs }; }

export function set(patch) {
  prefs = { ...prefs, ...patch };
  write();
  apply();
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

export function init() {
  prefs = read();
  apply();
  // React to OS theme flips while in "auto"
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => { if (prefs.theme === 'auto') apply(); });
  // Terminal `theme` command talks to us through an event
  document.addEventListener('os:theme', e => set({ theme: e.detail }));
}
