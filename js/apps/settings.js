/* settings.js — theme, accent, wallpaper, and session controls. */

import { el, fill } from '../dom.js';
import { icon } from '../icons.js';
import { ACCENTS, WALLPAPERS, get, set, subscribe } from '../prefs.js';
import { profile } from '../data.js';

const THEMES = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark',  label: 'Dark',  icon: 'moon' },
  { id: 'auto',  label: 'Use system', icon: 'settings' },
];

export default {
  id: 'settings',
  title: 'Settings',
  icon: 'settings',
  width: 640,
  height: 560,
  minWidth: 420,

  mount(body, win, wm) {
    const themeRow  = el('div.seg', { role: 'radiogroup', 'aria-label': 'Theme' });
    const accentRow = el('div.swatches', { role: 'radiogroup', 'aria-label': 'Accent colour' });
    const wallRow   = el('div.seg', { role: 'radiogroup', 'aria-label': 'Wallpaper' });

    function render() {
      const p = get();

      fill(themeRow, THEMES.map(t =>
        el('button.seg-btn', {
          type: 'button', role: 'radio',
          'aria-checked': String(p.theme === t.id),
          onclick: () => set({ theme: t.id }),
        }, el('span.seg-icon', { html: icon(t.icon) }), t.label),
      ));

      fill(accentRow, ACCENTS.map(a =>
        el('button.swatch', {
          type: 'button', role: 'radio',
          title: a.label,
          'aria-label': a.label,
          'aria-checked': String(p.accent === a.id),
          style: { '--sw': a.light, '--sw-dark': a.dark },
          onclick: () => set({ accent: a.id }),
        }, el('span.sw-dot', { 'aria-hidden': 'true' })),
      ));

      fill(wallRow, WALLPAPERS.map(w =>
        el('button.seg-btn', {
          type: 'button', role: 'radio',
          'aria-checked': String(p.wallpaper === w.id),
          onclick: () => set({ wallpaper: w.id }),
        }, w.label),
      ));
    }

    const section = (title, desc, control) =>
      el('section.set-card', {},
        el('div.set-text', {},
          el('h2', { text: title }),
          desc ? el('p', { text: desc }) : null,
        ),
        control,
      );

    body.append(el('div.set', {},
      el('h1.set-title', { text: 'Personalisation' }),

      section('Theme', 'Light, dark, or follow your operating system.', themeRow),
      section('Accent colour', 'Applied live across every window.', accentRow),
      section('Wallpaper', 'All three are pure CSS — no image downloads.', wallRow),

      el('h1.set-title', { text: 'System' }),

      section('Session', 'Open windows and their positions are remembered in this browser.',
        el('div.btn-row', {},
          el('button.btn', {
            type: 'button',
            onclick: () => { wm.clearSession(); wm.closeAll(); },
          }, 'Reset session'),
          el('button.btn', {
            type: 'button',
            onclick: () => wm.minimizeAll(),
          }, 'Minimise all'),
        )),

      section('About', 'Build information and how to reach me.',
        el('div.btn-row', {},
          el('button.btn', { type: 'button', onclick: () => wm.open('about') }, 'About ' + profile.name),
          el('button.btn', { type: 'button', onclick: () => wm.open('contact') }, 'Contact'),
        )),

      el('p.set-foot', { text: profile.build.edition + ' ' + profile.build.version +
        ' · Build ' + profile.build.buildNo + ' · No dependencies, no build step.' }),
    ));

    render();
    const unsub = subscribe(render);
    return { destroy: unsub };
  },
};
