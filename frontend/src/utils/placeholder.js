// Generates inline-SVG data-URI placeholders so images work offline with no
// network calls or broken-image errors.

const PALETTE = [
  ['#e4efe9', '#15694f'],
  ['#f7e9df', '#c9692e'],
  ['#e1edf4', '#2f6b8f'],
  ['#f8eed6', '#b9831c'],
  ['#efe7f3', '#7a4f8f'],
  ['#f3f1ec', '#6b6862'],
];

// Pick a deterministic color pair from a seed.
function pick(seed) {
  const key = String(seed);
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// Soft two-tone image placeholder with an optional label.
export function placeholderImage(seed = 'item', label = '', width = 600, height = 600) {
  const [bg, fg] = pick(seed);
  const text = (label || '').slice(0, 18);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <circle cx="${width * 0.5}" cy="${height * 0.42}" r="${width * 0.13}" fill="none" stroke="${fg}" stroke-width="6" opacity="0.55"/>
    <path d="M${width * 0.37} ${height * 0.62} l${width * 0.08} -${width * 0.08} l${width * 0.07} ${width * 0.05} l${width * 0.1} -${width * 0.11} l${width * 0.06} ${width * 0.14} z" fill="${fg}" opacity="0.55"/>
    ${text ? `<text x="50%" y="86%" font-family="system-ui, sans-serif" font-size="${width * 0.06}" fill="${fg}" text-anchor="middle" opacity="0.8">${escapeXml(text)}</text>` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Round avatar placeholder showing initials.
export function placeholderAvatar(name = '?', size = 96) {
  const [bg, fg] = pick(name);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="50%" dy="0.35em" font-family="system-ui, sans-serif" font-weight="600" font-size="${size * 0.4}" fill="${fg}" text-anchor="middle">${escapeXml(initials)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Escape user text for safe inclusion in SVG markup.
function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  );
}
