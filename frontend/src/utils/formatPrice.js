// Format an amount as a localized price string (defaults to EUR).
export function formatPrice(amount, currency = 'EUR', locale = 'en-IE') {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
  }).format(Number(amount));
}

// Format the in-app virtual credits (used for promotions).
export function formatCredits(amount) {
  const value = Number(amount) || 0;
  return `${value.toLocaleString('en-US')} credits`;
}
