/* icons.js — hand-drawn Fluent-style line icons. No third-party icon font,
   no vendor logos: everything here is original 24x24 geometry. */

const P = (d, extra = "") =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

const SVG = (body, vb = "0 0 24 24") =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

const RAW = {
  /* ---- start: generic 3x3 app grid (deliberately not a vendor mark) ---- */
  start: SVG(
    [0, 1, 2].flatMap(r => [0, 1, 2].map(c =>
      `<circle cx="${6 + c * 6}" cy="${6 + r * 6}" r="1.7" fill="currentColor"/>`)).join("")
  ),

  search: SVG(P("M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z") + P("M15.5 15.5 20 20")),

  /* ---- app icons ---- */
  user: SVG(P("M12 3.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z") +
            P("M4.5 20.25c0-3.6 3.36-6 7.5-6s7.5 2.4 7.5 6")),

  folder: SVG(P("M3.25 7.5A2.25 2.25 0 0 1 5.5 5.25h3.2c.6 0 1.16.24 1.59.66l1.1 1.09h7.11a2.25 2.25 0 0 1 2.25 2.25v8A2.25 2.25 0 0 1 18.5 19.5h-13a2.25 2.25 0 0 1-2.25-2.25v-9.75Z") +
              P("M3.25 10.5h17.5", 'opacity=".45"')),

  notepad: SVG(P("M6.75 3.25h7.5l4.5 4.5v13a1.5 1.5 0 0 1-1.5 1.5h-10.5a1.5 1.5 0 0 1-1.5-1.5v-16a1.5 1.5 0 0 1 1.5-1.5Z") +
               P("M14 3.5V7.5h4.25") + P("M8.5 12.5h7") + P("M8.5 16h7") + P("M8.5 19h4")),

  terminal: SVG(P("M3.25 5.5A2.25 2.25 0 0 1 5.5 3.25h13a2.25 2.25 0 0 1 2.25 2.25v13a2.25 2.25 0 0 1-2.25 2.25h-13a2.25 2.25 0 0 1-2.25-2.25v-13Z") +
                P("M7 9.25 9.5 12 7 14.75") + P("M12.25 15.25h5")),

  mail: SVG(P("M3.25 7.25A2 2 0 0 1 5.25 5.25h13.5a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2v-9.5Z") +
            P("m3.75 7.75 7.09 5.32a2 2 0 0 0 2.32 0l7.09-5.32")),

  photos: SVG(P("M3.25 6.5A2.25 2.25 0 0 1 5.5 4.25h13a2.25 2.25 0 0 1 2.25 2.25v11a2.25 2.25 0 0 1-2.25 2.25h-13a2.25 2.25 0 0 1-2.25-2.25v-11Z") +
              `<circle cx="8.75" cy="9.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/>` +
              P("m3.5 17 4.9-4.4a2 2 0 0 1 2.7.04L15 16.5" ) +
              P("m13.5 14.2 2.3-2.1a2 2 0 0 1 2.72.05l2.23 2.1")),

  settings: SVG(P("M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z") +
                P("M12 2.75c.5 0 .95.35 1.06.84l.33 1.5a7.4 7.4 0 0 1 1.7.98l1.45-.5a1.1 1.1 0 0 1 1.29.5l.85 1.47a1.1 1.1 0 0 1-.23 1.36l-1.13 1a7.5 7.5 0 0 1 0 1.96l1.13 1a1.1 1.1 0 0 1 .23 1.36l-.85 1.47a1.1 1.1 0 0 1-1.29.5l-1.45-.5a7.4 7.4 0 0 1-1.7.98l-.33 1.5a1.1 1.1 0 0 1-1.06.84h-1.7a1.1 1.1 0 0 1-1.06-.84l-.33-1.5a7.4 7.4 0 0 1-1.7-.98l-1.45.5a1.1 1.1 0 0 1-1.29-.5l-.85-1.47a1.1 1.1 0 0 1 .23-1.36l1.13-1a7.5 7.5 0 0 1 0-1.96l-1.13-1a1.1 1.1 0 0 1-.23-1.36l.85-1.47a1.1 1.1 0 0 1 1.29-.5l1.45.5a7.4 7.4 0 0 1 1.7-.98l.33-1.5A1.1 1.1 0 0 1 10.3 2.75Z")),

  briefcase: SVG(P("M3.25 9.25A2 2 0 0 1 5.25 7.25h13.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2v-8Z") +
                 P("M9 7V5.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V7") +
                 P("M3.5 12.5h17", 'opacity=".45"')),

  code: SVG(P("m8.5 8.5-4 3.5 4 3.5") + P("m15.5 8.5 4 3.5-4 3.5") + P("m13.5 5.5-3 13")),

  /* ---- caption buttons (10x10 viewBox, 1px hairlines like Win11) ---- */
  capMin:  SVG(`<path d="M0 5.5h10" stroke="currentColor" stroke-width="1" fill="none"/>`, "0 0 10 10"),
  capMax:  SVG(`<rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" stroke-width="1" fill="none"/>`, "0 0 10 10"),
  capRestore: SVG(
    `<rect x="0.5" y="2.5" width="7" height="7" stroke="currentColor" stroke-width="1" fill="none"/>` +
    `<path d="M2.5 2.5V1.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1" stroke="currentColor" stroke-width="1" fill="none"/>`,
    "0 0 10 10"),
  capClose: SVG(`<path d="M0.5 0.5l9 9M9.5 0.5l-9 9" stroke="currentColor" stroke-width="1" fill="none"/>`, "0 0 10 10"),

  /* ---- tray + misc ---- */
  wifi: SVG(P("M2.5 8.5a13 13 0 0 1 19 0") + P("M5.75 12a8.5 8.5 0 0 1 12.5 0") + P("M9 15.5a4 4 0 0 1 6 0") +
            `<circle cx="12" cy="19" r="1.2" fill="currentColor"/>`),
  volume: SVG(P("M4.25 9.5h2.6l3.9-3.2a.75.75 0 0 1 1.25.58v10.24a.75.75 0 0 1-1.25.58l-3.9-3.2h-2.6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z") +
              P("M15.5 9.5a3.5 3.5 0 0 1 0 5") + P("M18 7a7 7 0 0 1 0 10")),
  battery: SVG(P("M2.75 8.75A1.5 1.5 0 0 1 4.25 7.25h12.5a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5H4.25a1.5 1.5 0 0 1-1.5-1.5v-6.5Z") +
               `<rect x="5" y="9.5" width="9" height="5" rx="1" fill="currentColor"/>` +
               P("M20.5 10.5v3")),
  power: SVG(P("M12 3.5v7") + P("M7.05 6.55a7 7 0 1 0 9.9 0")),
  sun: SVG(`<circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" stroke-width="1.6"/>` +
           P("M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4")),
  moon: SVG(P("M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z")),
  external: SVG(P("M13.5 4.5h6v6") + P("m19.5 4.5-8 8") + P("M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 5.5 6H10")),
  download: SVG(P("M12 3.75v11") + P("m7.5 10.25 4.5 4.5 4.5-4.5") + P("M4.25 19.25h15.5")),
  send: SVG(P("M20.5 3.5 3.75 10.2a.6.6 0 0 0 .05 1.12l6.2 2.1 2.1 6.2a.6.6 0 0 0 1.12.05Z") + P("m20.5 3.5-10.5 10.5")),
  chevron: SVG(P("m8.5 5.5 7 6.5-7 6.5")),
  refresh: SVG(P("M20 12a8 8 0 1 1-2.34-5.66") + P("M20 4.5V10h-5.5")),
  check: SVG(P("m4.5 12.5 5 5 10-11")),
  info: SVG(`<circle cx="12" cy="12" r="8.75" fill="none" stroke="currentColor" stroke-width="1.6"/>` +
            P("M12 11v5.5") + `<circle cx="12" cy="7.9" r="1.1" fill="currentColor"/>`),
  grid: SVG(P("M4.25 5.75A1.5 1.5 0 0 1 5.75 4.25h3.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a1.5 1.5 0 0 1-1.5-1.5v-3.5Z") +
            P("M13.25 5.75a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a1.5 1.5 0 0 1-1.5-1.5v-3.5Z") +
            P("M4.25 14.75a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a1.5 1.5 0 0 1-1.5-1.5v-3.5Z") +
            P("M13.25 14.75a1.5 1.5 0 0 1 1.5-1.5h3.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a1.5 1.5 0 0 1-1.5-1.5v-3.5Z")),
};

export function icon(name) {
  return RAW[name] ?? RAW.info;
}
export const iconNames = Object.keys(RAW);
