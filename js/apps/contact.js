/* contact.js — a Mail-style compose window.
   The site is static, so Send hands off to the visitor's mail client via mailto:.
   Swap `deliver()` for a fetch() to your own endpoint if you add a backend. */

import { el, openExternal } from '../dom.js';
import { icon } from '../icons.js';
import { profile } from '../data.js';

export default {
  id: 'contact',
  title: 'New message — Mail',
  icon: 'mail',
  width: 620,
  height: 560,
  minWidth: 400,

  mount(body, win, wm) {
    const status = el('p.form-status', { role: 'status', 'aria-live': 'polite' });

    const field = (id, label, node, hint) =>
      el('div.field', {},
        el('label', { for: id, text: label }),
        node,
        hint ? el('p.field-hint', { text: hint }) : null,
      );

    const from = el('input.input', { id: 'c-from', type: 'email', required: true,
      placeholder: 'you@company.com', autocomplete: 'email' });
    const subject = el('input.input', { id: 'c-subject', type: 'text', required: true,
      placeholder: 'Contract work / role / question' });
    const message = el('textarea.input.textarea', { id: 'c-message', required: true, rows: '8',
      placeholder: 'A couple of sentences on what you need and your timeline.' });

    function validate() {
      if (!from.value.trim() || !from.checkValidity()) return 'Add a valid email so I can reply.';
      if (!subject.value.trim()) return 'Give the message a subject.';
      if (message.value.trim().length < 10) return 'Add a little more detail to the message.';
      return null;
    }

    function deliver() {
      const url = 'mailto:' + encodeURIComponent(profile.email) +
        '?subject=' + encodeURIComponent(subject.value.trim()) +
        '&body=' + encodeURIComponent(message.value.trim() + '\n\n— ' + from.value.trim());
      window.location.href = url;
    }

    const form = el('form.form', {
      novalidate: true,
      onsubmit: e => {
        e.preventDefault();
        const err = validate();
        if (err) {
          status.textContent = err;
          status.className = 'form-status is-err';
          return;
        }
        deliver();
        status.textContent = 'Opening your mail app with the message ready to send…';
        status.className = 'form-status is-ok';
      },
    },
      el('div.mail-head', {},
        el('span.mail-to-label', { text: 'To' }),
        el('span.mail-chip', {},
          el('span.chip-avatar', { text: profile.initials, 'aria-hidden': 'true' }),
          profile.fullName || profile.name,
          el('span.chip-mail', { text: '<' + profile.email + '>' }),
        ),
      ),
      field('c-from', 'Your email', from),
      field('c-subject', 'Subject', subject),
      field('c-message', 'Message', message),
      status,
      el('div.form-actions', {},
        el('button.btn.btn-accent', { type: 'submit' },
          el('span.btn-icon', { html: icon('send') }), 'Send'),
        el('button.btn', {
          type: 'button',
          onclick: async () => {
            try {
              await navigator.clipboard.writeText(profile.email);
              status.textContent = 'Email address copied.';
              status.className = 'form-status is-ok';
            } catch {
              status.textContent = profile.email;
              status.className = 'form-status';
            }
          },
        }, 'Copy address'),
        el('button.btn', { type: 'button', onclick: () => win.close() }, 'Discard'),
      ),
      el('p.form-note', {},
        el('span', { html: icon('info') }),
        'This opens your own mail app — nothing is sent through this site, and nothing is stored.'),
    );

    body.append(form);
    setTimeout(() => from.focus(), 80);
    return {};
  },
};
