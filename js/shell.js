/* shell.js — everything outside the windows: desktop icons, taskbar,
   start menu, tray flyout, clock and the desktop context menu. */

import { el, fill } from './dom.js';
import { icon } from './icons.js';
import { profile } from './data.js';
import { get, set } from './prefs.js';

export function initShell(wm, refs) {
  const { iconsEl, taskbarEl, startEl, ctxEl } = refs;

  /* ================= desktop icons ================= */
  function buildDesktopIcons() {
    const items = wm.appList.filter(a => a.desktop);
    fill(iconsEl, items.map(a =>
      el('button.desk-icon', {
        type: 'button',
        'data-app': a.id,
        title: a.title,
        ondblclick: () => wm.open(a.id),
        onclick: e => {
          iconsEl.querySelectorAll('.desk-icon').forEach(n => n.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
        },
        onkeydown: e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wm.open(a.id); }
        },
      },
        el('span.glyph', { html: icon(a.icon) }),
        el('span.label', { text: a.title.split(' — ')[0] }),
      ),
    ));
  }

  iconsEl.addEventListener('pointerdown', e => {
    if (e.target === iconsEl) {
      iconsEl.querySelectorAll('.desk-icon').forEach(n => n.classList.remove('selected'));
    }
  });

  /* ================= taskbar ================= */
  const startBtn = el('button.tb-btn#start-btn', {
    type: 'button',
    title: 'Start',
    'aria-label': 'Start',
    'aria-expanded': 'false',
    'aria-controls': 'start-menu',
    onclick: e => { e.stopPropagation(); toggleStart(); },
  }, el('span', { html: icon('start') }));

  const taskButtons = el('div#tb-tasks', { style: { display: 'flex', gap: '4px' } });
  const center = el('div#tb-center', {}, startBtn, taskButtons);

  const clockEl = el('div#tb-clock');
  const trayBtn = el('button.tray-btn', {
    type: 'button', title: 'Quick settings', 'aria-label': 'Quick settings',
    onclick: e => { e.stopPropagation(); toggleTray(); },
  },
    el('span', { html: icon('wifi') }),
    el('span', { html: icon('volume') }),
    el('span', { html: icon('battery') }),
  );
  const clockBtn = el('button.tray-btn', {
    type: 'button', title: 'Date and time',
    onclick: () => wm.open('settings'),
  }, clockEl);
  const showDesktopBtn = el('button#show-desktop', {
    type: 'button', title: 'Show desktop', 'aria-label': 'Show desktop',
    onclick: () => wm.minimizeAll(),
  });

  taskbarEl.append(
    el('div', {}),                        // left spacer (grid col 1)
    center,
    el('div#tb-right', {}, trayBtn, clockBtn, showDesktopBtn),
  );

  /* pinned + running buttons */
  function buildTaskButtons() {
    const pinned = wm.appList.filter(a => a.pinned);
    fill(taskButtons, pinned.map(a =>
      el('button.tb-btn', {
        type: 'button',
        'data-app': a.id,
        title: a.title,
        'aria-label': a.title,
        onclick: () => {
          const open = wm.windows.filter(w => w.app.id === a.id && !w._closing);
          if (!open.length) return wm.open(a.id);
          const top = open[open.length - 1];
          if (wm.active === top && !top.minimized) top.minimize();
          else { top.unminimize(); wm.focus(top); }
        },
      },
        el('span', { html: icon(a.icon) }),
        el('span.ind', { 'aria-hidden': 'true' }),
      ),
    ));
    syncTaskButtons();
  }

  function syncTaskButtons() {
    taskButtons.querySelectorAll('.tb-btn').forEach(btn => {
      const id = btn.dataset.app;
      const open = wm.windows.some(w => w.app.id === id && !w._closing);
      const active = wm.active && wm.active.app.id === id && !wm.active.minimized;
      btn.dataset.running = String(open);
      btn.dataset.active = String(!!active);
    });
  }

  ['open', 'close', 'focus', 'minimize', 'restore', 'change'].forEach(ev =>
    wm.on(ev, syncTaskButtons));

  /* ---- clock ---- */
  function tickClock() {
    const now = new Date();
    fill(clockEl,
      el('span', { text: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }),
      el('span', { text: now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) }),
    );
    clockBtn.title = now.toLocaleString();
    // re-align to the next minute boundary rather than drifting on an interval
    setTimeout(tickClock, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 20);
  }

  /* ================= start menu ================= */
  const searchInput = el('input', {
    type: 'search',
    placeholder: 'Search apps, projects and skills',
    'aria-label': 'Search',
    oninput: () => renderStartApps(searchInput.value),
    onkeydown: e => {
      if (e.key === 'Escape') { closeStart(); }
      if (e.key === 'Enter') {
        const first = startApps.querySelector('.start-tile');
        if (first) first.click();
      }
    },
  });

  const startApps = el('div#start-apps');

  function renderStartApps(q = '') {
    const query = q.trim().toLowerCase();
    const hits = wm.appList.filter(a =>
      !query ||
      a.id.includes(query) ||
      a.title.toLowerCase().includes(query) ||
      (a.keywords || []).some(k => k.includes(query)));

    if (!hits.length) {
      fill(startApps, el('p#start-empty', { text: 'Nothing matches “' + q + '”.' }));
      return;
    }
    fill(startApps, hits.map(a =>
      el('button.start-tile', {
        type: 'button',
        onclick: () => { wm.open(a.id); closeStart(); },
      },
        el('span', { html: icon(a.icon) }),
        el('span.label', { text: a.title.split(' — ')[0] }),
      ),
    ));
  }

  startEl.append(
    el('div.start-search', {}, el('span', { html: icon('search') }), searchInput),
    el('div', {},
      el('div.start-section-head', {}, el('span', { text: 'All apps' })),
      startApps),
    el('div.start-footer', {},
      el('button.start-user', {
        type: 'button',
        onclick: () => { wm.open('about'); closeStart(); },
      },
        el('span.avatar', { text: profile.initials }),
        el('span.who', { text: profile.fullName || profile.name })),
      el('button.tb-btn', {
        type: 'button', title: 'Contact me', 'aria-label': 'Contact me',
        onclick: () => { wm.open('contact'); closeStart(); },
      }, el('span', { html: icon('power') })),
    ),
  );

  let startOpen = false;
  function toggleStart() { startOpen ? closeStart() : openStart(); }
  function openStart() {
    closeTray();
    startOpen = true;
    startEl.setAttribute('aria-hidden', 'false');
    startBtn.setAttribute('aria-expanded', 'true');
    startBtn.setAttribute('aria-pressed', 'true');
    searchInput.value = '';
    renderStartApps();
    setTimeout(() => searchInput.focus(), 60);
  }
  function closeStart() {
    startOpen = false;
    startEl.setAttribute('aria-hidden', 'true');
    startBtn.setAttribute('aria-expanded', 'false');
    startBtn.removeAttribute('aria-pressed');
  }

  /* ================= tray flyout ================= */
  const trayEl = el('div.flyout#tray-flyout', { 'aria-hidden': 'true' });
  document.body.append(trayEl);

  function renderTray() {
    const p = get();
    fill(trayEl,
      el('div.tray-grid', {},
        el('button.tray-tile', {
          type: 'button',
          'aria-pressed': String(p.theme === 'dark'),
          onclick: () => { set({ theme: p.theme === 'dark' ? 'light' : 'dark' }); renderTray(); },
        }, el('span', { html: icon(p.theme === 'dark' ? 'sun' : 'moon') }),
           el('span.tt-label', { text: p.theme === 'dark' ? 'Light mode' : 'Dark mode' })),
        el('button.tray-tile', {
          type: 'button',
          onclick: () => { wm.open('settings'); closeTray(); },
        }, el('span', { html: icon('settings') }), el('span.tt-label', { text: 'Settings' })),
        el('button.tray-tile', {
          type: 'button',
          onclick: () => { wm.minimizeAll(); closeTray(); },
        }, el('span', { html: icon('grid') }), el('span.tt-label', { text: 'Show desktop' })),
        el('button.tray-tile', {
          type: 'button',
          onclick: () => { wm.open('contact'); closeTray(); },
        }, el('span', { html: icon('mail') }), el('span.tt-label', { text: 'Contact' })),
      ),
      el('p.tray-foot', { text: profile.role + (profile.available ? ' · open to work' : '') }),
    );
  }

  let trayOpen = false;
  function toggleTray() { trayOpen ? closeTray() : openTray(); }
  function openTray() {
    closeStart();
    trayOpen = true;
    renderTray();
    trayEl.setAttribute('aria-hidden', 'false');
  }
  function closeTray() {
    trayOpen = false;
    trayEl.setAttribute('aria-hidden', 'true');
  }

  /* ================= context menu ================= */
  const CTX = [
    { label: 'Open File Explorer', icon: 'folder',   run: () => wm.open('explorer') },
    { label: 'Open Terminal',      icon: 'terminal', run: () => wm.open('terminal') },
    { sep: true },
    { label: 'Toggle dark mode',   icon: 'moon',     run: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }) },
    { label: 'Next wallpaper',     icon: 'photos',   run: cycleWallpaper },
    { sep: true },
    { label: 'Show desktop',       icon: 'grid',     run: () => wm.minimizeAll() },
    { label: 'Personalise',        icon: 'settings', run: () => wm.open('settings') },
  ];

  function cycleWallpaper() {
    const order = ['bloom', 'mesh', 'mono'];
    const cur = order.indexOf(get().wallpaper);
    set({ wallpaper: order[(cur + 1) % order.length] });
  }

  function openCtx(x, y) {
    fill(ctxEl, CTX.map(i => i.sep
      ? el('div.ctx-sep')
      : el('button.ctx-item', {
          type: 'button',
          onclick: () => { closeCtx(); i.run(); },
        }, el('span', { html: icon(i.icon) }), i.label)));

    ctxEl.setAttribute('aria-hidden', 'false');
    const r = ctxEl.getBoundingClientRect();
    ctxEl.style.left = Math.min(x, window.innerWidth  - r.width  - 8) + 'px';
    ctxEl.style.top  = Math.min(y, window.innerHeight - r.height - 8) + 'px';
  }
  function closeCtx() { ctxEl.setAttribute('aria-hidden', 'true'); }

  document.addEventListener('contextmenu', e => {
    // only on empty desktop / wallpaper — let windows keep the native menu
    if (e.target.closest('.win, #taskbar, #start-menu, .flyout')) return;
    e.preventDefault();
    openCtx(e.clientX, e.clientY);
  });

  /* ================= global dismiss ================= */
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#start-menu, #start-btn')) closeStart();
    if (!e.target.closest('#tray-flyout, .tray-btn')) closeTray();
    if (!e.target.closest('#context-menu')) closeCtx();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeStart(); closeTray(); closeCtx(); }
    // Ctrl+Space opens Start, since the real Windows key is owned by the OS
    if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); toggleStart(); }
  });

  /* ================= go ================= */
  buildDesktopIcons();
  buildTaskButtons();
  renderStartApps();
  tickClock();

  return { closeStart, closeTray, syncTaskButtons };
}
