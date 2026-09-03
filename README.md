# Portfolio OS

A portfolio presented as a desktop environment. Written from scratch in vanilla
JavaScript, CSS and HTML — **no framework, no dependencies, no build step.**

## Run it

ES modules need to be served over HTTP (opening `index.html` from the file
system will fail on CORS). Any static server works:

```bash
python -m http.server 5510
```

Then open <http://localhost:5510>.

## Make it yours

**Almost everything you need to edit is in one file: [`js/data.js`](js/data.js).**
It holds your name, bio, links, skills, projects, experience, education and
gallery. Search it for `TODO:` — every placeholder is marked.

Then:

| What | Where |
|---|---|
| Name, role, bio, links, resume URL | `js/data.js` → `profile` |
| Skills and levels | `js/data.js` → `skills` |
| Projects (Explorer + Terminal read this) | `js/data.js` → `projects` |
| Work history (feeds the resume) | `js/data.js` → `experience` |
| Gallery images | `js/data.js` → `gallery` (set `src` to use a real image) |
| Page title, description, social preview | `index.html` `<head>` |
| Colours, fonts, radii, spacing | `css/tokens.css` |

Drop-in assets, all optional:

- `assets/resume.pdf` — linked from `profile.resumeUrl`
- `assets/og.png` — 1200×630 social preview
- `assets/favicon.svg` — already provided; replace to rebrand

## Architecture

```
index.html            markup shell + no-JS fallback
css/
  tokens.css          design tokens: colour, type, radii, motion (light + dark)
  desktop.css         reset, wallpaper, desktop icons, snap preview
  window.css          window chrome: titlebar, caption buttons, resize handles
  taskbar.css         taskbar, start menu, flyouts, context menu
  apps.css            per-app content styles + shared controls
js/
  main.js             boot: prefs -> window manager -> apps -> shell
  wm.js               the window manager (see below)
  shell.js            desktop icons, taskbar, start menu, tray, context menu
  prefs.js            theme / accent / wallpaper, persisted
  data.js             ALL portfolio content
  dom.js              el() / fill() / esc() helpers
  icons.js            hand-drawn SVG icon set
  apps/
    index.js          app registry
    about.js  explorer.js  notepad.js
    terminal.js  photos.js  contact.js  settings.js
```

### The window manager (`js/wm.js`)

The interesting part. `WindowManager` owns an array of `AppWindow`s ordered by
z-index, where the last entry is topmost.

- **Focus stack** — clicking a window moves it to the end of the array and
  z-indexes are reassigned from a base of 100.
- **Drag** — pointer events with `setPointerCapture`, so the drag survives the
  cursor leaving the window. Dragging a maximized or snapped window tears it
  loose and repositions it proportionally under the cursor.
- **Resize** — eight handles, each clamped to minimum sizes and desktop bounds.
- **Snap** — dragging within 8px of an edge arms a zone (halves, quarters,
  maximize) and shows a live preview overlay; releasing applies it. The
  pre-snap geometry is remembered so restore returns to it.
- **Keyboard** — `Win`/`Alt` + arrows snap, `F11` toggles maximize, `Esc`
  closes a focused dialog.
- **Persistence** — open windows and their geometry are debounced into
  `localStorage` and restored on the next visit.
- **Reflow** — resizing the viewport re-derives snapped and maximized
  geometry and clamps loose windows back into bounds.

### Writing a new app

An app is a plain object. `mount()` receives the window body, the window, and
the manager; return an object with `destroy()` if you need cleanup.

```js
// js/apps/hello.js
import { el } from '../dom.js';

export default {
  id: 'hello',
  title: 'Hello',
  icon: 'info',          // any key from js/icons.js
  width: 480,
  height: 320,
  mount(body, win, wm) {
    body.append(el('div', { style: { padding: '20px' } }, 'Hello, world'));
    return {};
  },
};
```

Then import it in `js/apps/index.js` and add it to the `apps` array with
`desktop: true` and/or `pinned: true`.

Other supported fields: `dialog` (tighter dialog styling, `Esc` closes),
`resizable: false`, `singleton: false` (allow multiple instances),
`minWidth`, `minHeight`.

## Behaviour worth knowing

- **Deep links** — `?app=terminal` or `#terminal` opens straight into an app.
- **Themes** — light, dark, or follow the OS. Six accent colours, three
  wallpapers, all pure CSS (no image requests).
- **Terminal** — a real REPL over the portfolio data. `help` lists commands;
  history and Tab completion work.
- **Contact** — hands off to the visitor's mail client via `mailto:`. Nothing
  is sent through the site and nothing is stored. To take submissions
  server-side, replace `deliver()` in `js/apps/contact.js` with a `fetch()`.
- **Small screens** — below 720px wide (or 480px tall) the desktop metaphor is
  replaced with a plain contact card. A desktop needs a desktop.
- **No JavaScript** — `index.html` carries a crawlable fallback with your name,
  role and email, so the page is never blank for crawlers or with JS disabled.
- **Accessibility** — windows are focusable with ARIA roles, caption buttons
  are labelled, the start menu is a labelled dialog, and
  `prefers-reduced-motion` collapses all animation.

## Deploying

It's static, so anything works. No build command, no output directory.

- **GitHub Pages** — push, then Settings → Pages → deploy from branch root.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the
  repo and leave the build settings empty.

## Licence and attribution

All code and assets here are original. The window chrome is *inspired by*
Windows 11 as an homage — no Microsoft imagery, logos, icons or copyrighted
wallpapers are used. The wallpapers are CSS gradients and the icons are
hand-drawn SVG paths in `js/icons.js`.
