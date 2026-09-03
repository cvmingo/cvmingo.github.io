/* dom.js — tiny DOM helpers so app code stays readable without a framework. */

/** Escape text destined for an innerHTML template. */
export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * el('div.card', { onclick: fn, 'data-id': 3 }, 'text', childNode)
 * Tag supports a single #id and any number of .classes.
 */
export function el(spec, attrs, ...children) {
  const m = /^([a-zA-Z0-9-]*)((?:[.#][^.#]+)*)$/.exec(spec);
  if (!m) throw new Error('el(): bad spec ' + spec);
  const node = document.createElement(m[1] || 'div');

  (m[2].match(/[.#][^.#]+/g) || []).forEach(tok => {
    if (tok[0] === '.') node.classList.add(tok.slice(1));
    else node.id = tok.slice(1);
  });

  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') {
      // Object.assign cannot set CSS custom properties — they need setProperty.
      for (const [prop, val] of Object.entries(v)) {
        if (prop.startsWith('--')) node.style.setProperty(prop, val);
        else node.style[prop] = val;
      }
    }
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }

  children.flat(Infinity).forEach(c => {
    if (c == null || c === false) return;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return node;
}

/** Replace an element's children in one go. */
export function fill(parent, ...children) {
  parent.replaceChildren(...children.flat(Infinity).filter(c => c != null && c !== false));
  return parent;
}

/** Open an external link safely in a new tab. */
export function openExternal(url) {
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) w.opener = null;
}
