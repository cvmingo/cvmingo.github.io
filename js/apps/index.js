/* apps/index.js — the app registry.
   `desktop` puts an icon on the desktop, `pinned` puts one in the taskbar.
   Adding an app = write the module, import it, add it to this array. */

import about    from './about.js';
import explorer from './explorer.js';
import notepad  from './notepad.js';
import terminal from './terminal.js';
import photos   from './photos.js';
import contact  from './contact.js';
import settings from './settings.js';

export const apps = [
  { ...explorer, desktop: true, pinned: true },
  { ...about,    desktop: true, pinned: true },
  { ...notepad,  desktop: true, pinned: true },
  { ...terminal, desktop: true, pinned: true },
  { ...photos,   desktop: true, pinned: true },
  { ...contact,  desktop: true, pinned: true },
  { ...settings, desktop: false, pinned: true },
];

export default apps;
