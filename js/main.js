/* main.js — boot. Wires prefs, the window manager, the apps and the shell. */

import { WindowManager } from './wm.js';
import { initShell } from './shell.js';
import { apps } from './apps/index.js';
import * as prefs from './prefs.js';

const FIRST_RUN_KEY = 'clintos.seen.v1';

function boot() {
  prefs.init();

  const wm = new WindowManager(
    document.getElementById('desktop'),
    document.getElementById('snap-preview'),
  );

  wm.registerAll(apps);

  initShell(wm, {
    iconsEl:   document.getElementById('desktop-icons'),
    taskbarEl: document.getElementById('taskbar'),
    startEl:   document.getElementById('start-menu'),
    ctxEl:     document.getElementById('context-menu'),
  });

  /* Deep link: ?app=terminal (or #terminal) opens straight into an app */
  const params = new URLSearchParams(location.search);
  const deep = params.get('app') || location.hash.replace('#', '');

  if (deep && wm.app(deep)) {
    wm.open(deep);
  } else if (!wm.loadSession()) {
    // First visit (or a cleared session): a sensible opening arrangement.
    wm.open('explorer');
    if (!localStorage.getItem(FIRST_RUN_KEY)) {
      setTimeout(() => {
        wm.open('about');
        try { localStorage.setItem(FIRST_RUN_KEY, '1'); } catch (err) { /* ignore */ }
      }, 420);
    }
  }

  // Expose for console tinkering and for the `open` terminal command's sake.
  window.OS = { wm, prefs };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
