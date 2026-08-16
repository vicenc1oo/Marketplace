/* Inline-SVG icon set; recolorable via currentColor.
   Developed by: mde-maga • mateferr • mprazere • psantos- */

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
  'heart-filled': <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" fill="currentColor" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  gavel: <><path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8" /><path d="m16 16 6-6" /><path d="m8 8 6-6" /><path d="m9 7 8 8" /><path d="m21 11-8-8" /><path d="M4 21h8" /></>,
  tag: <><path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 11.6A2 2 0 0 1 3 10.2V4a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" /></>,
  location: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  check: <path d="m20 6-11 11-5-5" />,
  star: <path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1Z" />,
  'star-filled': <path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1Z" fill="currentColor" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></>,
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  wallet: <><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" /><circle cx="16" cy="12" r="1.3" fill="currentColor" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2a2.1 2.1 0 1 0-3-3Z" /><path d="M12 15 9 12a14 14 0 0 1 3-7c1.7-1.9 4-2.8 7-3 .2 3-.7 5.3-3 7a14 14 0 0 1-4 3Z" /><path d="M9 12H4s.5-2.8 2-4 5 0 5 0" /><path d="M12 15v5s2.8-.5 4-2 0-5 0-5" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  // category glyphs
  device: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M11 18h2" /></>,
  home: <><path d="M3 10 12 3l9 7" /><path d="M5 9v11h14V9" /></>,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17 10 7h4l2 4h-6" /><path d="M14 7h3" /></>,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z" />,
  sofa: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M2 13a2 2 0 0 1 2 2v3h16v-3a2 2 0 0 1 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2H6a2 2 0 0 0-2-2 2 2 0 0 0-2 2Z" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18M3 12h18" /></>,
  toy: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3" /></>,
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8, ...rest }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {glyph}
    </svg>
  );
}
