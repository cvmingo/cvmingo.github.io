/* terminal.js — a real little REPL over my portfolio data.
   Command history, tab completion, and commands that actually drive the OS. */

import { el, openExternal } from '../dom.js';
import { profile, skills, projects, experience, terminalFacts } from '../data.js';

const PROMPT = 'clint@portfolio:~$';

export default {
  id: 'terminal',
  title: 'Terminal',
  icon: 'terminal',
  width: 760,
  height: 460,
  minWidth: 420,

  mount(body, win, wm) {
    const out   = el('div.term-out', { 'aria-live': 'polite' });
    const input = el('input.term-input', {
      type: 'text', spellcheck: 'false', autocomplete: 'off',
      'aria-label': 'Terminal input',
    });
    const line = el('div.term-line', {},
      el('span.term-prompt', { text: PROMPT }), input);

    const term = el('div.term', { onclick: () => input.focus() }, out, line);
    body.append(term);

    const history = [];
    let hIndex = -1;

    /* ---------- output helpers ---------- */
    const write = (text, cls) => {
      out.append(el('div.term-row' + (cls ? '.' + cls : ''), { text }));
      term.scrollTop = term.scrollHeight;
    };
    const writeNode = node => {
      out.append(node);
      term.scrollTop = term.scrollHeight;
    };
    const blank = () => write(' ');

    /* ---------- commands ---------- */
    const commands = {
      help() {
        write('Available commands:', 'term-head');
        Object.keys(commands).sort().forEach(k => {
          write('  ' + k.padEnd(12) + (DESC[k] || ''));
        });
        blank();
        write('Tip: Tab completes, Up/Down walks history.', 'term-dim');
      },

      whoami() {
        write(profile.fullName || profile.name, 'term-head');
        write(profile.role);
        write(profile.location);
        write(profile.email, 'term-accent');
      },

      about() {
        profile.bio.forEach(p => { write(p); blank(); });
      },

      skills() {
        skills.forEach(g => {
          write(g.group, 'term-head');
          g.items.forEach(s => {
            const filled = Math.round(s.level / 5);
            write('  ' + s.name.padEnd(22) +
                  '[' + '#'.repeat(filled) + '.'.repeat(20 - filled) + '] ' + s.level + '%');
          });
          blank();
        });
      },

      projects(args) {
        if (args[0]) {
          const p = projects.find(x => x.id === args[0] || x.name.toLowerCase() === args.join(' ').toLowerCase());
          if (!p) return write('No such project: ' + args[0], 'term-err');
          write(p.name, 'term-head');
          write(p.kind + ' · ' + p.year, 'term-dim');
          blank();
          write(p.detail);
          blank();
          write('Stack: ' + p.stack.join(', '));
          p.links.forEach(l => {
            const a = el('div.term-row', {},
              '  ' + l.label + ': ',
              el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.url }));
            writeNode(a);
          });
          return;
        }
        write('Projects (run `projects <id>` for detail):', 'term-head');
        projects.forEach(p => write('  ' + p.id.padEnd(16) + p.name + ' — ' + p.summary.slice(0, 48) + '…'));
      },

      experience() {
        experience.forEach(j => {
          write(j.role + ' @ ' + j.org, 'term-head');
          write(j.period, 'term-dim');
          j.bullets.forEach(b => write('  - ' + b));
          blank();
        });
      },

      stack() {
        write('Default reach-for stack:', 'term-head');
        terminalFacts.stack.forEach(s => write('  · ' + s));
      },

      links() {
        profile.links.forEach(l => {
          writeNode(el('div.term-row', {},
            '  ' + l.label.padEnd(10),
            el('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', text: l.url })));
        });
      },

      contact() {
        write('Opening the contact app…', 'term-dim');
        wm.open('contact');
      },

      open(args) {
        const id = (args[0] || '').toLowerCase();
        if (!id) return write('usage: open <' + wm.appList.map(a => a.id).join('|') + '>', 'term-err');
        if (!wm.app(id)) return write('No such app: ' + id, 'term-err');
        wm.open(id);
        write('Launched ' + id + '.', 'term-dim');
      },

      apps() {
        write('Installed apps:', 'term-head');
        wm.appList.forEach(a => write('  ' + a.id.padEnd(12) + a.title));
      },

      theme(args) {
        const t = (args[0] || '').toLowerCase();
        if (!['light', 'dark', 'auto'].includes(t)) return write('usage: theme <light|dark|auto>', 'term-err');
        document.dispatchEvent(new CustomEvent('os:theme', { detail: t }));
        write('Theme set to ' + t + '.', 'term-dim');
      },

      neofetch() {
        const rows = [
          profile.name + '@portfolio',
          '-'.repeat(20),
          'OS:      ' + profile.build.edition + ' ' + profile.build.version,
          'Build:   ' + profile.build.buildNo,
          'Shell:   portfolio-sh',
          'WM:      wm.js (vanilla)',
          'Deps:    0',
          'Role:    ' + profile.role,
          'Uptime:  ' + Math.round(performance.now() / 1000) + 's',
        ];
        const art = ['   ▄▄▄▄▄▄▄   ', '  █ ▄▄▄▄▄ █  ', '  █ █   █ █  ', '  █ █▄▄▄█ █  ', '  █▄▄▄▄▄▄▄█  ', '   ▄▄  ▄ ▄   ', '  █ ▄▄▄▄ █▄  ', '   ▀▀ ▀▀▀ ▀  '];
        const n = Math.max(rows.length, art.length);
        for (let i = 0; i < n; i++) {
          writeNode(el('div.term-row', {},
            el('span.term-accent', { text: (art[i] || ' '.repeat(13)) }),
            el('span', { text: '  ' + (rows[i] || '') })));
        }
      },

      date() { write(new Date().toString()); },

      echo(args) { write(args.join(' ')); },

      fortune() {
        const f = terminalFacts.funFacts;
        write(f[Math.floor(Math.random() * f.length)] || 'No fortunes configured.');
      },

      ls() {
        write('projects/  skills/  experience/  resume.txt  contact.md', 'term-accent');
      },

      sudo() {
        write('Nice try. ' + profile.name + ' is not in the sudoers file.', 'term-err');
        write('This incident has been reported. (It has not.)', 'term-dim');
      },

      clear() { out.replaceChildren(); },

      exit() { win.close(); },
    };

    const DESC = {
      help: 'this list',
      whoami: 'who I am',
      about: 'longer intro',
      skills: 'skills with levels',
      projects: 'list, or `projects <id>`',
      experience: 'work history',
      stack: 'my default stack',
      links: 'where to find me',
      contact: 'open the contact app',
      open: 'launch an app',
      apps: 'list installed apps',
      theme: 'light | dark | auto',
      neofetch: 'system info',
      date: 'current date/time',
      echo: 'print arguments',
      fortune: 'a random fact',
      ls: 'list the "filesystem"',
      sudo: 'do not',
      clear: 'clear the screen',
      exit: 'close the terminal',
    };

    /* ---------- run ---------- */
    function submit(raw) {
      const text = raw.trim();
      writeNode(el('div.term-row', {},
        el('span.term-prompt', { text: PROMPT }),
        el('span', { text: ' ' + raw })));
      if (!text) return;

      history.push(text);
      hIndex = history.length;

      const [cmd, ...args] = text.split(/\s+/);
      const fn = commands[cmd.toLowerCase()];
      if (fn) {
        try { fn(args); } catch (err) { write(String(err), 'term-err'); }
      } else {
        write(cmd + ': command not found. Try `help`.', 'term-err');
      }
      blank();
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        submit(input.value);
        input.value = '';
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!history.length) return;
        hIndex = Math.max(0, hIndex - 1);
        input.value = history[hIndex] ?? '';
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        hIndex = Math.min(history.length, hIndex + 1);
        input.value = history[hIndex] ?? '';
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const frag = input.value.trim().toLowerCase();
        if (!frag) return;
        const hits = Object.keys(commands).filter(k => k.startsWith(frag));
        if (hits.length === 1) input.value = hits[0] + ' ';
        else if (hits.length > 1) { write(hits.join('   '), 'term-dim'); }
        return;
      }
      if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); commands.clear(); }
      if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) {
        e.preventDefault();
        write('^C', 'term-dim');
        input.value = '';
      }
    });

    /* ---------- greeting ---------- */
    write(terminalFacts.motd, 'term-accent');
    write('Type `whoami`, `projects`, or `neofetch` to start.', 'term-dim');
    blank();

    setTimeout(() => input.focus(), 60);
    return { onFocus: () => input.focus() };
  },
};
