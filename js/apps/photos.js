/* photos.js — gallery with a lightbox. Works with CSS-gradient placeholders
   until real images are dropped in (set `src` on a gallery entry). */

import { el, fill } from '../dom.js';
import { icon } from '../icons.js';
import { gallery } from '../data.js';

export default {
  id: 'photos',
  title: 'Photos',
  icon: 'photos',
  width: 860,
  height: 600,
  minWidth: 420,

  mount(body, win, wm) {
    let index = -1;

    const grid = el('div.gal-grid');
    const stage = el('div.gal-stage', { 'aria-hidden': 'true' });
    const root = el('div.gal', {}, grid, stage);

    const thumbFace = item =>
      item.src
        ? el('img.gal-img', { src: item.src, alt: item.title, loading: 'lazy' })
        : el('div.gal-ph', { style: { background: item.grad }, 'aria-hidden': 'true' });

    fill(grid, gallery.map((item, i) =>
      el('button.gal-cell', {
        type: 'button',
        'aria-label': 'Open ' + item.title,
        onclick: () => show(i),
      },
        thumbFace(item),
        el('span.gal-meta', {},
          el('span.gal-title', { text: item.title }),
          el('span.gal-cap', { text: item.caption }),
        ),
      ),
    ));

    function show(i) {
      index = (i + gallery.length) % gallery.length;
      const item = gallery[index];
      fill(stage,
        el('div.st-toolbar', {},
          el('span.st-count', { text: (index + 1) + ' / ' + gallery.length }),
          el('div.st-spacer'),
          el('button.tool-btn', { type: 'button', title: 'Previous', 'aria-label': 'Previous',
            onclick: () => show(index - 1) }, el('span.flip', { html: icon('chevron') })),
          el('button.tool-btn', { type: 'button', title: 'Next', 'aria-label': 'Next',
            onclick: () => show(index + 1) }, el('span', { html: icon('chevron') })),
          el('button.tool-btn', { type: 'button', title: 'Close', 'aria-label': 'Close view',
            onclick: hide }, el('span', { html: icon('capClose') })),
        ),
        el('div.st-frame', {}, item.src
          ? el('img.st-img', { src: item.src, alt: item.title })
          : el('div.st-ph', { style: { background: item.grad }, 'aria-hidden': 'true' })),
        el('div.st-caption', {},
          el('strong', { text: item.title }),
          el('span', { text: item.caption }),
        ),
      );
      stage.setAttribute('aria-hidden', 'false');
      root.classList.add('viewing');
      win.setTitle(item.title + ' — Photos');
    }

    function hide() {
      stage.setAttribute('aria-hidden', 'true');
      root.classList.remove('viewing');
      win.setTitle('Photos');
      index = -1;
    }

    const onKey = e => {
      if (index < 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
      if (e.key === 'Escape')     { e.preventDefault(); hide(); }
    };
    win.el.addEventListener('keydown', onKey);

    body.append(root);
    return { destroy: () => win.el.removeEventListener('keydown', onKey) };
  },
};
