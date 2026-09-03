/* notepad.js — my resume, as a text editor. Real menu bar, real save/print,
   real word-wrap toggle and a live Ln/Col readout. */

import { el, fill, esc } from '../dom.js';
import { profile, skills, experience, education, projects } from '../data.js';

function resumeText() {
  const line = (c = '=') => c.repeat(64);
  const out = [];
  const name = (profile.fullName || profile.name).toUpperCase();

  out.push(name, profile.role, line());
  out.push(profile.location + '   ·   ' + profile.email);
  profile.links.forEach(l => out.push(l.label + ': ' + l.url));
  out.push('', 'SUMMARY', line('-'));
  profile.bio.forEach(p => { out.push(p, ''); });

  out.push('EXPERIENCE', line('-'));
  experience.forEach(j => {
    out.push(j.role + '  |  ' + j.org);
    out.push(j.period);
    j.bullets.forEach(b => out.push('  - ' + b));
    out.push('');
  });

  out.push('SELECTED PROJECTS', line('-'));
  projects.forEach(p => {
    out.push(p.name + '  (' + p.year + ', ' + p.kind + ')');
    out.push('  ' + p.summary);
    out.push('  Stack: ' + p.stack.join(', '));
    if (p.links.length) out.push('  ' + p.links.map(l => l.label + ': ' + l.url).join('  |  '));
    out.push('');
  });

  out.push('SKILLS', line('-'));
  skills.forEach(g => out.push(g.group + ': ' + g.items.map(s => s.name).join(', ')));

  out.push('', 'EDUCATION', line('-'));
  education.forEach(e => out.push(e.what + ' — ' + e.org + ' (' + e.period + ')'));

  return out.join('\n');
}

const MENUS = {
  File: [
    { label: 'Save',          act: 'save',     accel: 'Ctrl+S' },
    { label: 'Save as .txt…', act: 'download',  accel: 'Ctrl+Shift+S' },
    { label: 'Print…',        act: 'print',    accel: 'Ctrl+P' },
    { sep: true },
    { label: 'Reset to resume', act: 'reset' },
    { label: 'Exit',            act: 'exit' },
  ],
  Edit: [
    { label: 'Select all', act: 'selectAll' },
    { label: 'Copy all',   act: 'copyAll' },
  ],
  Format: [
    { label: 'Word wrap', act: 'wrap', check: true },
  ],
  Help: [
    { label: 'About me', act: 'about' },
  ],
};

export default {
  id: 'notepad',
  title: 'Resume.txt — Notepad',
  icon: 'notepad',
  width: 760,
  height: 600,
  minWidth: 420,

  mount(body, win, wm) {
    let wrap = true;

    // Persisted edits live here, per browser. Falls back to the generated resume.
    const DOC_KEY = 'clintos.notepad.doc.v1';
    const loadSaved = () => { try { return localStorage.getItem(DOC_KEY); } catch { return null; } };

    const area = el('textarea.np-area', {
      spellcheck: 'false',
      'aria-label': 'Resume text',
      wrap: 'soft',
    });
    const saved = loadSaved();
    area.value = saved != null ? saved : resumeText();

    let dirty = false;                 // unsaved changes present?
    const baseTitle = 'Resume.txt';
    const markDirty = () => {
      if (dirty) return;
      dirty = true;
      win.setTitle(baseTitle + '* — Notepad');
    };
    const markClean = () => {
      dirty = false;
      win.setTitle(baseTitle + ' — Notepad');
    };

    const pos  = el('span', { text: 'Ln 1, Col 1' });
    const bar  = el('div.np-status', {}, pos, el('span', { text: 'UTF-8' }));
    const menubar = el('div.np-menubar', { role: 'menubar' });
    const drop = el('div.np-dropdown', { role: 'menu', 'aria-hidden': 'true' });

    let openMenu = null;

    function closeMenu() {
      openMenu = null;
      drop.setAttribute('aria-hidden', 'true');
      menubar.querySelectorAll('.np-menu').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }

    function showMenu(name, btn) {
      if (openMenu === name) return closeMenu();
      openMenu = name;
      fill(drop, MENUS[name].map(item =>
        item.sep
          ? el('div.np-sep')
          : el('button.np-item', {
              type: 'button', role: 'menuitem',
              onclick: () => { closeMenu(); run(item.act); },
            },
            el('span.np-check', { text: item.check && wrap ? '✓' : '' }),
            el('span.np-label', { text: item.label }),
            item.accel ? el('span.np-accel', { text: item.accel }) : null),
      ));
      drop.style.left = btn.offsetLeft + 'px';
      drop.setAttribute('aria-hidden', 'false');
      menubar.querySelectorAll('.np-menu').forEach(b =>
        b.setAttribute('aria-expanded', String(b.dataset.menu === name)));
    }

    fill(menubar, Object.keys(MENUS).map(name =>
      el('button.np-menu', {
        type: 'button', role: 'menuitem', 'data-menu': name, 'aria-expanded': 'false',
        onclick: e => showMenu(name, e.currentTarget),
      }, name),
    ));

    function download() {
      const blob = new Blob([area.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: (profile.name || 'resume') + '-resume.txt' });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function print() {
      const w = window.open('', '_blank', 'width=820,height=900');
      if (!w) return;
      w.document.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>' +
        esc(profile.fullName || profile.name) + ' — Resume</title>' +
        '<style>body{margin:40px;font:12px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap}</style>' +
        '</head><body>' + esc(area.value) + '</body></html>');
      w.document.close();
      w.focus();
      w.print();
    }

    function persist() {
      try {
        localStorage.setItem(DOC_KEY, area.value);
        markClean();
        flash('Saved');
      } catch {
        flash('Could not save (storage blocked)');
      }
    }

    async function run(act) {
      if (act === 'save')      persist();
      if (act === 'download')  download();
      if (act === 'print')     print();
      if (act === 'reset') {
        area.value = resumeText();
        try { localStorage.removeItem(DOC_KEY); } catch {}
        markClean();
        updatePos();
        flash('Reset to generated resume');
      }
      if (act === 'exit')      win.close();
      if (act === 'selectAll') { area.focus(); area.select(); }
      if (act === 'copyAll') {
        try { await navigator.clipboard.writeText(area.value); flash('Copied to clipboard'); }
        catch { area.focus(); area.select(); flash('Press Ctrl+C to copy'); }
      }
      if (act === 'wrap') {
        wrap = !wrap;
        area.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
        area.style.overflowX = wrap ? 'hidden' : 'auto';
      }
      if (act === 'about') wm.open('about');
    }

    function flash(msg) {
      pos.textContent = msg;
      setTimeout(updatePos, 1600);
    }

    function updatePos() {
      const upto = area.value.slice(0, area.selectionStart);
      const lines = upto.split('\n');
      pos.textContent = 'Ln ' + lines.length + ', Col ' + (lines[lines.length - 1].length + 1);
    }

    ['keyup', 'click', 'input', 'select'].forEach(ev => area.addEventListener(ev, updatePos));
    area.addEventListener('input', markDirty);

    const onDocDown = e => { if (!e.target.closest('.np-menubar, .np-dropdown')) closeMenu(); };
    document.addEventListener('pointerdown', onDocDown);

    const onKey = e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.shiftKey ? download() : persist();   // Ctrl+S saves; Ctrl+Shift+S exports
      }
      if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); print(); }
      if (e.key === 'Escape') closeMenu();
    };
    win.el.addEventListener('keydown', onKey);

    body.append(el('div.np', {}, menubar, drop, area, bar));
    updatePos();

    return {
      destroy() {
        document.removeEventListener('pointerdown', onDocDown);
        win.el.removeEventListener('keydown', onKey);
      },
    };
  },
};
