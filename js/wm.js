/* wm.js — the window manager.
   Owns: window lifecycle, focus/z-order stack, drag, 8-way resize,
   edge snapping (mouse + Win/Alt+arrow), and session persistence. */

import { icon } from './icons.js';

const EDGE_PX     = 8;    // proximity to a desktop edge that arms a snap
const CORNER_FRAC = 0.28; // top/bottom fraction of an edge treated as a corner
const MIN_W = 320, MIN_H = 180;
const Z_BASE = 100;
const LS_KEY = 'clintos.session.v2';

let seq = 0;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ------------------------------------------------------------------ */
/* One window                                                          */
/* ------------------------------------------------------------------ */
class AppWindow {
  constructor(wm, app, opts = {}) {
    this.wm  = wm;
    this.app = app;
    this.id  = 'win-' + (++seq);

    this.resizable   = app.resizable !== false;
    this.maximized   = false;
    this.minimized   = false;
    this.restoreRect = null;
    this.snapped     = null;

    const d = wm.bounds();
    const w = clamp(opts.w ?? app.width  ?? 720, MIN_W, d.w);
    const h = clamp(opts.h ?? app.height ?? 480, MIN_H, d.h);
    const p = wm.nextCascade(w, h);
    this.rect = { x: opts.x ?? p.x, y: opts.y ?? p.y, w, h };

    this.build();
    this.applyRect();
  }

  build() {
    const el = document.createElement('div');
    el.className = 'win opening';
    el.id = this.id;
    el.dataset.app = this.app.id;
    el.dataset.resizable = String(this.resizable);
    el.setAttribute('role', this.app.dialog ? 'dialog' : 'application');
    el.setAttribute('aria-label', this.app.title);
    el.tabIndex = -1;
    if (this.app.dialog) el.classList.add('dialog');
    if (this.app.minWidth)  el.style.minWidth  = this.app.minWidth  + 'px';
    if (this.app.minHeight) el.style.minHeight = this.app.minHeight + 'px';

    const handles = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se']
      .map(d => '<div class="rz rz-' + d + '" data-dir="' + d + '"></div>').join('');

    el.innerHTML =
      '<div class="win-titlebar">' +
        '<span class="win-icon">' + icon(this.app.icon) + '</span>' +
        '<span class="win-title"></span>' +
        '<div class="win-captions">' +
          '<button class="cap-btn" data-cap="min"   title="Minimize" aria-label="Minimize">' + icon('capMin') + '</button>' +
          '<button class="cap-btn" data-cap="max"   title="Maximize" aria-label="Maximize">' + icon('capMax') + '</button>' +
          '<button class="cap-btn" data-cap="close" title="Close"    aria-label="Close">'    + icon('capClose') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="win-body"></div>' + handles;

    this.el      = el;
    this.titleEl = el.querySelector('.win-title');
    this.bodyEl  = el.querySelector('.win-body');
    this.barEl   = el.querySelector('.win-titlebar');
    this.maxBtn  = el.querySelector('[data-cap="max"]');
    this.titleEl.textContent = this.app.title;

    el.addEventListener('pointerdown', () => this.wm.focus(this), true);

    el.querySelector('.win-captions').addEventListener('click', e => {
      const cap = e.target.closest('.cap-btn');
      if (!cap) return;
      if (cap.dataset.cap === 'min')   this.minimize();
      if (cap.dataset.cap === 'max')   this.toggleMaximize();
      if (cap.dataset.cap === 'close') this.close();
    });

    this.barEl.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.cap-btn')) return;
      this.wm.beginDrag(this, e);
    });
    this.barEl.addEventListener('dblclick', e => {
      if (!e.target.closest('.cap-btn') && this.resizable) this.toggleMaximize();
    });

    el.querySelectorAll('.rz').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (e.button === 0) this.wm.beginResize(this, e, h.dataset.dir);
      });
    });

    this.wm.desktopEl.appendChild(el);
    this.clearAnimClass('opening');
    if (typeof this.app.mount === 'function') {
      this.api = this.app.mount(this.bodyEl, this, this.wm) || null;
    }
  }

  /* Clear a one-shot animation class. animationend alone is not enough:
     a background/throttled tab may never fire it, which would leave the
     window stuck at the keyframe's starting transform. */
  clearAnimClass(cls) {
    let done = false;
    const drop = () => {
      if (done) return;
      done = true;
      this.el.classList.remove(cls);
    };
    this.el.addEventListener('animationend', drop, { once: true });
    setTimeout(drop, 400);
  }

  setTitle(t) {
    this.titleEl.textContent = t;
    this.el.setAttribute('aria-label', t);
    this.wm.emit('change', this);
  }

  applyRect() {
    const r = this.rect;
    this.el.style.left   = r.x + 'px';
    this.el.style.top    = r.y + 'px';
    this.el.style.width  = r.w + 'px';
    this.el.style.height = r.h + 'px';
  }

  /* animate a geometry change (snap, maximize, restore) */
  animateTo(rect) {
    this.el.classList.add('animating');
    this.rect = rect;
    this.applyRect();
    clearTimeout(this._animT);
    this._animT = setTimeout(() => this.el.classList.remove('animating'), 240);
  }

  setMaxButton(state) {
    this.maxBtn.innerHTML = icon(state === 'restore' ? 'capRestore' : 'capMax');
    const label = state === 'restore' ? 'Restore' : 'Maximize';
    this.maxBtn.title = label;
    this.maxBtn.setAttribute('aria-label', label);
  }

  toggleMaximize() { this.maximized ? this.restore() : this.maximize(); }

  maximize() {
    if (!this.resizable || this.maximized) return;
    if (!this.snapped) this.restoreRect = { ...this.rect };
    const d = this.wm.bounds();
    this.maximized = true;
    this.snapped = 'max';
    this.el.classList.add('maximized');
    this.setMaxButton('restore');
    this.animateTo({ x: 0, y: 0, w: d.w, h: d.h });
    this.wm.emit('change', this);
    this.wm.save();
  }

  restore() {
    if (!this.maximized && !this.snapped) return;
    this.maximized = false;
    this.snapped = null;
    this.el.classList.remove('maximized');
    this.setMaxButton('max');
    this.animateTo(this.restoreRect ?? this.rect);
    this.wm.emit('change', this);
    this.wm.save();
  }

  /* snap to a named zone: left|right|tl|tr|bl|br|max */
  snapTo(zone) {
    if (!this.resizable) return;
    if (zone === 'max') return this.maximize();
    if (!this.snapped) this.restoreRect = { ...this.rect };
    this.maximized = false;
    this.el.classList.remove('maximized');
    this.setMaxButton('max');
    this.snapped = zone;
    const r = this.wm.zoneRect(zone);
    if (r) this.animateTo(r);
    this.wm.emit('change', this);
    this.wm.save();
  }

  minimize() {
    if (this.minimized) return;
    this.minimized = true;
    this.el.classList.add('minimized');
    this.wm.emit('minimize', this);
    this.wm.focusNext(this);
    this.wm.save();
  }

  unminimize() {
    if (!this.minimized) return;
    this.minimized = false;
    this.el.classList.remove('minimized');
    this.el.classList.add('opening');
    this.clearAnimClass('opening');
    this.wm.emit('restore', this);
    this.wm.save();
  }

  close() {
    if (this._closing) return;
    this._closing = true;
    if (this.api && typeof this.api.destroy === 'function') {
      try { this.api.destroy(); } catch (err) { console.warn('[wm] destroy failed', err); }
    }
    this.el.classList.add('closing');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      this.el.remove();
      this.wm.forget(this);
    };
    this.el.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, 300); // safety net if the animation never fires
  }
}

/* ------------------------------------------------------------------ */
/* The manager                                                         */
/* ------------------------------------------------------------------ */
export class WindowManager {
  constructor(desktopEl, snapEl) {
    this.desktopEl = desktopEl;
    this.snapEl    = snapEl;
    this.apps      = new Map();
    this.windows   = [];   // z-order: last entry is topmost
    this.listeners = {};
    this.cascade   = 0;
    this.active    = null;

    this.wireGlobalKeys();
    window.addEventListener('resize', () => this.reflow());
  }

  /* ---- tiny event emitter ---- */
  on(evt, fn) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(fn);
    return this;
  }
  emit(evt) {
    const args = [].slice.call(arguments, 1);
    (this.listeners[evt] || []).forEach(fn => fn.apply(null, args));
  }

  /* ---- app registry ---- */
  register(app) { this.apps.set(app.id, app); return this; }
  registerAll(list) { list.forEach(a => this.register(a)); return this; }
  app(id) { return this.apps.get(id); }
  get appList() { return Array.from(this.apps.values()); }

  bounds() {
    const r = this.desktopEl.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  }

  nextCascade(w, h) {
    const d = this.bounds();
    const n = this.cascade++ % 6;
    const x = clamp(Math.round(d.w / 2 - w / 2) + n * 28 - 40, 8, Math.max(8, d.w - w - 8));
    const y = clamp(Math.round(d.h / 2 - h / 2) + n * 28 - 40, 8, Math.max(8, d.h - h - 8));
    return { x, y };
  }

  /* ---- open / find ---- */
  open(appId, opts) {
    const app = this.apps.get(appId);
    if (!app) { console.warn('[wm] unknown app: ' + appId); return null; }

    if (app.singleton !== false) {
      const existing = this.windows.find(w => w.app.id === appId && !w._closing);
      if (existing) {
        existing.unminimize();
        this.focus(existing);
        return existing;
      }
    }
    const win = new AppWindow(this, app, opts || {});
    this.windows.push(win);
    this.focus(win);
    this.emit('open', win);
    this.save();
    return win;
  }

  forget(win) {
    this.windows = this.windows.filter(w => w !== win);
    if (this.active === win) this.active = null;
    this.emit('close', win);
    this.focusNext();
    this.save();
  }

  /* ---- focus / z-order ---- */
  focus(win) {
    if (!win || win._closing || this.active === win) return;
    this.windows = this.windows.filter(w => w !== win);
    this.windows.push(win);
    this.windows.forEach((w, i) => { w.el.style.zIndex = String(Z_BASE + i); });
    this.windows.forEach(w => w.el.classList.toggle('focused', w === win));
    this.active = win;
    win.el.focus({ preventScroll: true });
    this.emit('focus', win);
  }

  focusNext(exclude) {
    const next = this.windows.slice().reverse()
      .find(w => w !== exclude && !w.minimized && !w._closing);
    if (next) { this.active = null; this.focus(next); }
    else {
      this.active = null;
      this.windows.forEach(w => w.el.classList.remove('focused'));
      this.emit('focus', null);
    }
  }

  minimizeAll() { this.windows.slice().forEach(w => w.minimize()); }
  closeAll()    { this.windows.slice().forEach(w => w.close()); }

  /* ---- snap geometry ---- */
  zoneRect(zone) {
    const b = this.bounds();
    const hw = Math.round(b.w / 2), hh = Math.round(b.h / 2);
    const map = {
      max:   { x: 0,  y: 0,  w: b.w,      h: b.h },
      left:  { x: 0,  y: 0,  w: hw,       h: b.h },
      right: { x: hw, y: 0,  w: b.w - hw, h: b.h },
      tl:    { x: 0,  y: 0,  w: hw,       h: hh },
      tr:    { x: hw, y: 0,  w: b.w - hw, h: hh },
      bl:    { x: 0,  y: hh, w: hw,       h: b.h - hh },
      br:    { x: hw, y: hh, w: b.w - hw, h: b.h - hh },
    };
    return map[zone] || null;
  }

  zoneAt(px, py) {
    const b = this.bounds();
    if (py <= EDGE_PX) return 'max';
    if (px <= EDGE_PX) {
      if (py < b.h * CORNER_FRAC) return 'tl';
      if (py > b.h * (1 - CORNER_FRAC)) return 'bl';
      return 'left';
    }
    if (px >= b.w - EDGE_PX) {
      if (py < b.h * CORNER_FRAC) return 'tr';
      if (py > b.h * (1 - CORNER_FRAC)) return 'br';
      return 'right';
    }
    return null;
  }

  showSnap(zone) {
    const r = this.zoneRect(zone);
    if (!r) return this.hideSnap();
    const d = this.desktopEl.getBoundingClientRect();
    this.snapEl.style.left   = (d.left + r.x) + 'px';
    this.snapEl.style.top    = (d.top  + r.y) + 'px';
    this.snapEl.style.width  = r.w + 'px';
    this.snapEl.style.height = r.h + 'px';
    this.snapEl.classList.add('show');
  }
  hideSnap() { this.snapEl.classList.remove('show'); }

  /* ---- drag ---- */
  beginDrag(win, ev) {
    if (win.minimized) return;
    const d = this.desktopEl.getBoundingClientRect();
    const bar = win.barEl;
    let rect  = { ...win.rect };
    let grabX = ev.clientX - d.left - rect.x;
    let grabY = ev.clientY - d.top  - rect.y;
    let zone  = null;
    let torn  = !win.maximized && !win.snapped;
    const startX = ev.clientX, startY = ev.clientY;

    document.body.classList.add('wm-busy');
    bar.setPointerCapture(ev.pointerId);

    const move = e => {
      const px = e.clientX - d.left, py = e.clientY - d.top;
      const b  = this.bounds();

      /* dragging a maximized/snapped window tears it loose under the cursor */
      if (!torn) {
        if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 6) return;
        const target = win.restoreRect || { w: 720, h: 480 };
        const ratio  = clamp(grabX / Math.max(1, rect.w), 0, 1);
        win.maximized = false;
        win.snapped   = null;
        win.el.classList.remove('maximized');
        win.setMaxButton('max');
        rect  = { x: 0, y: 0, w: target.w, h: target.h };
        grabX = Math.round(target.w * ratio);
        grabY = Math.min(grabY, 16);
        torn  = true;
      }

      rect.x = clamp(px - grabX, -rect.w + 80, b.w - 80);
      rect.y = clamp(py - grabY, 0, b.h - 32);
      win.rect = rect;
      win.applyRect();

      const z = this.zoneAt(px, py);
      if (z !== zone) {
        zone = z;
        zone ? this.showSnap(zone) : this.hideSnap();
      }
    };

    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      document.body.classList.remove('wm-busy');
      this.hideSnap();
      if (zone) win.snapTo(zone);
      else this.save();
    };

    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  }

  /* ---- resize ---- */
  beginResize(win, ev, dir) {
    if (win.maximized || !win.resizable) return;
    const start  = { ...win.rect };
    const sx = ev.clientX, sy = ev.clientY;
    const b = this.bounds();
    const minW = Math.max(MIN_W, win.app.minWidth  || 0);
    const minH = Math.max(MIN_H, win.app.minHeight || 0);
    const handle = ev.currentTarget;

    document.body.classList.add('wm-busy');
    handle.setPointerCapture(ev.pointerId);
    win.snapped = null;

    const move = e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      const r = { ...start };

      if (dir.indexOf('e') > -1) r.w = clamp(start.w + dx, minW, b.w - start.x);
      if (dir.indexOf('s') > -1) r.h = clamp(start.h + dy, minH, b.h - start.y);
      if (dir.indexOf('w') > -1) {
        const right = start.x + start.w;
        r.w = clamp(start.w - dx, minW, right);
        r.x = right - r.w;
      }
      if (dir.indexOf('n') > -1) {
        const bottom = start.y + start.h;
        r.h = clamp(start.h - dy, minH, bottom);
        r.y = bottom - r.h;
      }
      win.rect = r;
      win.applyRect();
      if (win.api && typeof win.api.onResize === 'function') win.api.onResize(r);
    };

    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      document.body.classList.remove('wm-busy');
      this.save();
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  /* keep everything inside the desktop when the viewport changes */
  reflow() {
    const d = this.bounds();
    this.windows.forEach(w => {
      if (w.maximized) { w.rect = { x: 0, y: 0, w: d.w, h: d.h }; w.applyRect(); return; }
      if (w.snapped) {
        const r = this.zoneRect(w.snapped);
        if (r) { w.rect = r; w.applyRect(); return; }
      }
      w.rect.w = Math.min(w.rect.w, d.w);
      w.rect.h = Math.min(w.rect.h, d.h);
      w.rect.x = clamp(w.rect.x, -w.rect.w + 80, Math.max(0, d.w - 80));
      w.rect.y = clamp(w.rect.y, 0, Math.max(0, d.h - 32));
      w.applyRect();
    });
  }

  wireGlobalKeys() {
    window.addEventListener('keydown', e => {
      const typing = e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]');
      const a = this.active;

      /* Win/Cmd/Alt + arrows = snap the focused window */
      if ((e.metaKey || e.altKey) && a && !a.minimized && e.key.indexOf('Arrow') === 0) {
        e.preventDefault();
        if (e.key === 'ArrowLeft')  return a.snapTo('left');
        if (e.key === 'ArrowRight') return a.snapTo('right');
        if (e.key === 'ArrowUp')    return a.snapTo('max');
        if (e.key === 'ArrowDown')  return (a.maximized || a.snapped) ? a.restore() : a.minimize();
      }
      if (e.key === 'Escape' && a && a.app.dialog && !typing) { a.close(); return; }
      if (e.key === 'F11' && a) { e.preventDefault(); a.toggleMaximize(); }
    });
  }

  /* ---- persistence ---- */
  save() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => {
      try {
        const data = {
          windows: this.windows.filter(w => !w._closing).map(w => ({
            app: w.app.id,
            rect: w.restoreRect || w.rect,
            maximized: w.maximized,
            snapped: w.snapped,
            minimized: w.minimized,
          })),
        };
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      } catch (err) { /* private mode / quota — session just won't persist */ }
    }, 250);
  }

  loadSession() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (err) { return false; }
    if (!data || !data.windows || !data.windows.length) return false;
    let opened = 0;
    data.windows.forEach(s => {
      if (!this.apps.has(s.app)) return;
      const w = this.open(s.app, s.rect);
      if (!w) return;
      opened++;
      w.restoreRect = { ...s.rect };
      if (s.maximized) w.maximize();
      else if (s.snapped) w.snapTo(s.snapped);
      if (s.minimized) w.minimize();
    });
    return opened > 0;
  }

  clearSession() {
    try { localStorage.removeItem(LS_KEY); } catch (err) {}
  }
}
