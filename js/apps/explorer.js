/* explorer.js — File Explorer over my projects, skills and experience.
   Sidebar picks a "folder"; the content pane renders that view. */

import { el, fill, openExternal } from '../dom.js';
import { icon } from '../icons.js';
import { projects, skills, experience, education } from '../data.js';

const FOLDERS = [
  { id: 'projects',   label: 'Projects',   icon: 'folder' },
  { id: 'skills',     label: 'Skills',     icon: 'grid' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
];

export default {
  id: 'explorer',
  title: 'Portfolio — File Explorer',
  icon: 'folder',
  width: 900,
  height: 580,
  minWidth: 560,
  minHeight: 360,

  mount(body, win, wm) {
    let folder = 'projects';
    let selected = projects[0]?.id ?? null;

    const crumb   = el('div.exp-crumb');
    const content = el('div.exp-content');
    const status  = el('div.exp-status');

    /* ---------- sidebar ---------- */
    const nav = el('nav.exp-nav', { 'aria-label': 'Locations' },
      FOLDERS.map(f =>
        el('button.exp-navitem', {
          type: 'button',
          'data-folder': f.id,
          'aria-current': f.id === folder ? 'page' : null,
          onclick: () => go(f.id),
        }, el('span.ni-icon', { html: icon(f.icon) }), f.label),
      ),
    );

    /* ---------- toolbar ---------- */
    const toolbar = el('div.exp-toolbar', {},
      el('button.tool-btn', {
        type: 'button', title: 'Refresh', 'aria-label': 'Refresh',
        onclick: () => render(),
      }, el('span', { html: icon('refresh') })),
      crumb,
    );

    body.append(
      el('div.exp', {}, nav, el('div.exp-main', {}, toolbar, content, status)),
    );

    /* ---------- views ---------- */
    function projectsView() {
      const list = el('ul.proj-list', { role: 'listbox', 'aria-label': 'Projects' },
        projects.map(p =>
          el('li.proj-row', {
            role: 'option',
            tabindex: '0',
            'aria-selected': p.id === selected ? 'true' : 'false',
            onclick: () => { selected = p.id; render(); },
            onkeydown: e => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selected = p.id; render(); }
            },
          },
            el('span.pr-icon', { html: icon(p.featured ? 'code' : 'folder') }),
            el('span.pr-name', { text: p.name }),
            el('span.pr-kind', { text: p.kind }),
            el('span.pr-year', { text: p.year }),
          ),
        ),
      );

      const p = projects.find(x => x.id === selected) || projects[0];
      const detail = !p ? el('div.proj-detail') : el('div.proj-detail', {},
        el('div.pd-head', {},
          el('span.pd-icon', { html: icon('code') }),
          el('div', {},
            el('h2', { text: p.name }),
            el('p.pd-meta', { text: p.kind + ' · ' + p.year }),
          ),
        ),
        el('p.pd-summary', { text: p.summary }),
        el('h3', { text: 'What it involved' }),
        el('p.pd-detail', { text: p.detail }),
        el('h3', { text: 'Stack' }),
        el('ul.tag-row', {}, p.stack.map(s => el('li.tag', { text: s }))),
        p.links.length
          ? el('div.pd-links', {}, p.links.map(l =>
              el('button.btn', { type: 'button', onclick: () => openExternal(l.url) },
                l.label, el('span.btn-icon', { html: icon('external') })),
            ))
          : el('p.muted', { text: 'No public link for this one.' }),
      );

      status.textContent = projects.length + ' items · 1 selected';
      return el('div.exp-split', {}, list, detail);
    }

    function skillsView() {
      status.textContent = skills.reduce((n, g) => n + g.items.length, 0) + ' skills';
      return el('div.exp-pad', {},
        skills.map(g =>
          el('section.skill-group', {},
            el('h2', { text: g.group }),
            el('ul.skill-list', {},
              g.items.map(s =>
                el('li.skill', {},
                  el('span.sk-name', { text: s.name }),
                  el('span.sk-meter', {
                    role: 'meter',
                    'aria-valuenow': s.level,
                    'aria-valuemin': '0',
                    'aria-valuemax': '100',
                    'aria-label': s.name,
                  }, el('span.sk-fill', { style: { width: s.level + '%' } })),
                  el('span.sk-num', { text: s.level }),
                ),
              ),
            ),
          ),
        ),
      );
    }

    function experienceView() {
      status.textContent = experience.length + ' roles';
      return el('div.exp-pad', {},
        el('h2', { text: 'Experience' }),
        el('ol.timeline', {},
          experience.map(j =>
            el('li.tl-item', {},
              el('div.tl-dot', { 'aria-hidden': 'true' }),
              el('h3', { text: j.role }),
              el('p.tl-meta', { text: j.org + ' · ' + j.period }),
              el('ul.tl-bullets', {}, j.bullets.map(b => el('li', { text: b }))),
            ),
          ),
        ),
        el('h2', { text: 'Education' }),
        el('ul.plain', {}, education.map(e =>
          el('li', {}, el('strong', { text: e.what }), ' — ' + e.org + ' (' + e.period + ')'),
        )),
      );
    }

    /* ---------- render ---------- */
    function render() {
      nav.querySelectorAll('.exp-navitem').forEach(b =>
        b.setAttribute('aria-current', b.dataset.folder === folder ? 'page' : 'false'));

      const label = FOLDERS.find(f => f.id === folder)?.label ?? '';
      fill(crumb,
        el('span.cr-root', { text: 'Portfolio' }),
        el('span.cr-sep', { html: icon('chevron') }),
        el('span.cr-here', { text: label }),
      );

      const view = folder === 'skills' ? skillsView()
                 : folder === 'experience' ? experienceView()
                 : projectsView();
      fill(content, view);
      win.setTitle(label + ' — File Explorer');
    }

    function go(id) { folder = id; render(); }

    render();
    return {};
  },
};
