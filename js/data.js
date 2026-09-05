/* data.js — ALL of your portfolio content lives here.
   This is the only file you need to edit to make the site yours.
   Nothing below is design or logic — just facts about you.

   Migrated from your old portfolio (clintmingo.infinityfreeapp.com).
   A few spots are marked REVIEW: — worth a second look before you publish. */

export const profile = {
  name:      'Clint',
  fullName:  'Clint Mingo',
  initials:  'CM',
  role:      'Full Stack Developer',
  tagline:   'I build exceptional digital experiences at the intersection of design and technology.',
  location:  'Cebu City, Philippines',
  // REVIEW: your old portfolio lists clintmingo98@gmail.com. Your account here
  // is ceo@photoeditingcompany.com — pick whichever you want visitors to use.
  email:     'clintmingo98@gmail.com',
  phone:     '+63 912 670 1724',
  available: true,                          // shows the green "open to work" dot
  bio: [
    'I am a passionate Full Stack Developer building scalable web and mobile applications. I specialize in clean, efficient, user-friendly solutions using modern technologies, with a focus on offline-first apps and practical AI integration.',
    'My approach combines strong technical foundations with creative problem-solving to deliver projects that exceed expectations.',
  ],
  // Shown in the About dialog, mimicking a system "version" block
  build: {
    edition: 'Portfolio OS',
    version: '1.0',
    buildNo: new Date().getFullYear() + '.1',
  },
  links: [
    // REVIEW: add your real GitHub / LinkedIn — they weren't on the old site.
    { label: 'GitHub',   url: 'https://github.com/cvmingo',      icon: 'code' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/cvmingo/', icon: 'user' },
    { label: 'Email',    url: 'mailto:clintmingo98@gmail.com', icon: 'mail' },
  ],
  resumeUrl: 'assets/resume.pdf',           // drop your PDF here, or remove the button
};

/* ---------------------------------------------------------------- */
/* Skills — grouped, each with a 0-100 confidence used by the meter  */
/* REVIEW: these levels are my estimates — nudge them to taste.       */
/* ---------------------------------------------------------------- */
export const skills = [
  { group: 'Frontend', items: [
    { name: 'JavaScript',   level: 85 },
    { name: 'React',        level: 78 },
    { name: 'Tailwind CSS', level: 82 },
    { name: 'HTML / CSS',   level: 90 },
  ]},
  { group: 'Backend', items: [
    { name: 'PHP',     level: 85 },
    { name: 'Laravel', level: 78 },
    { name: 'Node.js', level: 74 },
    { name: 'Python',  level: 70 },
  ]},
  { group: 'Mobile', items: [
    { name: 'Flutter', level: 80 },
    { name: 'Dart',    level: 80 },
  ]},
  { group: 'Data & Tooling', items: [
    { name: 'MySQL',         level: 82 },
    { name: 'Hive (local)',  level: 78 },
    { name: 'Docker',        level: 65 },
    { name: 'Git',           level: 85 },
  ]},
];

/* ---------------------------------------------------------------- */
/* Projects — the File Explorer reads this                          */
/* ---------------------------------------------------------------- */
export const projects = [
  {
    id: 'capstone-ai',
    name: 'Capstone AI',
    kind: 'Web app',
    year: '2026',
    summary: 'An AI-powered capstone writing and defense preparation platform.',
    detail: 'CapstoneAI is an AI-powered academic assistance platform that helps students create, organize, and improve their capstone and thesis projects. It generates project titles, first drafts, chapter structures and methodologies, and tailors concept development to the user’s course, location and project context. Its standout feature is an AI defense simulator that lets students practise answering panel-style questions to build confidence before an actual defense — a writing assistant and preparation tool in one.',
    stack: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'AI API Integration'],
    links: [{ label: 'Live', url: 'https://capstoneai.infinityfreeapp.com/' }],
    featured: true,
  },
  {
    id: 'byaheroph',
    name: 'ByaheroPH',
    kind: 'Mobile app',
    year: '2026',
    summary: 'A smart offline-first commute alert app for Filipino commuters.',
    detail: 'ByaheroPH is a smart commute alert app for Filipino commuters who travel by jeepney, bus and UV Express. It uses GPS-based proximity detection to alert users as they approach a saved destination, so they never miss their stop. Built offline-first for areas with weak connectivity, it offers smart wake alerts, customizable sounds, vibration controls, saved routes, landmark alerts, sleep mode, voice alerts and real-time map-based route viewing — solving a real everyday commuting problem.',
    stack: ['Flutter', 'Dart', 'Hive', 'GPS', 'OpenStreetMap', 'Local Notifications'],
    links: [{ label: 'Live', url: 'https://byaheroph.infinityfreeapp.com/' }],
    featured: true,
  },
  {
    id: 'fintrix',
    name: 'Fintrix',
    kind: 'Mobile app',
    year: '2026',
    summary: 'An offline-first, AI-powered budget tracker for smarter personal finance.',
    detail: 'Fintrix is a modern offline-first budget tracker that helps users take control of their personal finances anytime, anywhere. It records income, tracks daily expenses, categorizes spending and monitors financial habits with no internet required. A clean, intuitive interface pairs with an AI-powered assistant that surfaces smart financial suggestions, spending insights and budgeting tips based on the user’s activity — fast, private, and efficient everyday money management.',
    stack: ['Flutter', 'Dart', 'Hive', 'Local Storage', 'AI Integration'],
    links: [{ label: 'Live', url: 'https://fintrix.keusg.com/' }],
    featured: true,
  },
];

/* ---------------------------------------------------------------- */
/* Experience — the Notepad "resume" reads this                     */
/* ---------------------------------------------------------------- */
export const experience = [
  {
    role: 'Full Stack Developer',
    org: 'Rafael IT Services',
    period: '2025 — present',
    bullets: [
      'Led development of enterprise-level web applications using modern frameworks and cloud infrastructure.',
      // REVIEW: add 1–2 more bullets with concrete numbers where you can
      // (users served, load-time cut, features shipped).
    ],
  },
];

/* REVIEW: your old site had no education section. Fill this in or delete it. */
export const education = [
  { what: 'TODO: Degree or programme', org: 'TODO: Institution', period: '20XX — 20XX' },
];

/* ---------------------------------------------------------------- */
/* Gallery — Photos app. Gradient placeholders for now; drop real    */
/* screenshots in by setting `src` on any entry (e.g. assets/x.png). */
/* ---------------------------------------------------------------- */
export const gallery = [
  { title: 'Capstone AI', caption: 'AI capstone writing + defense simulator', grad: 'linear-gradient(135deg,#0ea5e9,#1e3a8a)' },
  { title: 'ByaheroPH',   caption: 'Offline-first commute alerts',            grad: 'linear-gradient(135deg,#34d399,#065f46)' },
  { title: 'Fintrix',     caption: 'AI budget tracker, offline-first',        grad: 'linear-gradient(135deg,#fbbf24,#b45309)' },
  { title: 'Add a screenshot', caption: 'Set `src` on a gallery entry in data.js', grad: 'linear-gradient(135deg,#f472b6,#7c3aed)' },
];

/* ---------------------------------------------------------------- */
/* Terminal — extra facts the `whois` / `stack` commands print       */
/* ---------------------------------------------------------------- */
export const terminalFacts = {
  motd: 'Portfolio OS — type `help` for commands.',
  stack: ['PHP / Laravel', 'JavaScript / React', 'Flutter / Dart', 'Python', 'MySQL', 'Docker'],
  funFacts: [
    'I build offline-first apps — they should work on a jeepney with no signal.',
    'Most of my projects have an AI assistant baked in, not bolted on.',
  ],
};
