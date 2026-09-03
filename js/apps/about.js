/* about.js — the "About" dialog. A nod to winver, but the content is all mine. */

import { el, openExternal } from '../dom.js';
import { icon } from '../icons.js';
import { profile } from '../data.js';

export default {
  id: 'about',
  title: 'About ' + profile.name,
  icon: 'user',
  dialog: true,
  resizable: false,
  width: 520,
  height: 520,

  mount(body, win, wm) {
    const banner = el('div.about-banner', {},
      el('div.about-avatar', { text: profile.initials, 'aria-hidden': 'true' }),
      el('div.about-id', {},
        el('h1.about-name', { text: profile.fullName || profile.name }),
        el('p.about-role', { text: profile.role }),
        profile.available
          ? el('p.about-status', {},
              el('span.dot', { 'aria-hidden': 'true' }),
              'Open to new work')
          : null,
      ),
    );

    const versionBlock = el('div.about-version', {},
      el('p', { text: profile.build.edition }),
      el('p', { text: 'Version ' + profile.build.version + ' (Build ' + profile.build.buildNo + ')' }),
      el('p', { text: profile.location }),
    );

    const bio = el('div.about-bio', {},
      profile.bio.map(p => el('p', { text: p })),
    );

    const links = el('div.about-links', {},
      profile.links.map(l =>
        el('button.link-chip', {
          type: 'button',
          title: l.url,
          onclick: () => openExternal(l.url),
        }, el('span.chip-icon', { html: icon(l.icon || 'external') }), l.label),
      ),
    );

    const footer = el('div.dialog-footer', {},
      el('button.btn', {
        type: 'button',
        onclick: () => wm.open('contact'),
      }, 'Get in touch'),
      el('button.btn.btn-accent', {
        type: 'button',
        onclick: () => win.close(),
      }, 'OK'),
    );

    body.append(el('div.about', {}, banner, versionBlock, bio, links), footer);

    // Enter confirms, like a real dialog
    const onKey = e => { if (e.key === 'Enter') win.close(); };
    win.el.addEventListener('keydown', onKey);
    return { destroy: () => win.el.removeEventListener('keydown', onKey) };
  },
};
