// Absolute date
export function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Short time
export function formatTime(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Relative time
export function timeAgo(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit || unit === 'second') {
      return rtf.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return '';
}

// Auction countdown breakdown with a compact label like "2d 4h left".
export function timeRemaining(input) {
  const target = new Date(input).getTime();
  const diff = target - Date.now();
  if (Number.isNaN(target) || diff <= 0) {
    return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0, label: 'Ended' };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let label;
  if (days > 0) label = `${days}d ${hours}h left`;
  else if (hours > 0) label = `${hours}h ${minutes}m left`;
  else if (minutes > 0) label = `${minutes}m ${seconds}s left`;
  else label = `${seconds}s left`;

  return { ended: false, days, hours, minutes, seconds, label };
}
