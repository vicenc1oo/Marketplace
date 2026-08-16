// Form validation helpers; each returns an error string, or "" when valid.

// Value must not be empty.
export const required = (value, label = 'This field') =>
  value == null || String(value).trim() === '' ? `${label} is required.` : '';

// Value must be at least n characters.
export const minLength = (value, n, label = 'This field') =>
  String(value ?? '').trim().length < n ? `${label} must be at least ${n} characters.` : '';

// Value must be at most n characters.
export const maxLength = (value, n, label = 'This field') =>
  String(value ?? '').length > n ? `${label} must be ${n} characters or fewer.` : '';

// Value must look like an email address.
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
    ? ''
    : 'Enter a valid email address.';

// Password must be 8+ chars with upper, lower case and a number.
export const isStrongPassword = (value) => {
  const v = String(value ?? '');
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/[0-9]/.test(v))
    return 'Use upper, lower case and a number.';
  return '';
};

// Value must equal another value.
export const matches = (value, other, label = 'Values') =>
  value !== other ? `${label} do not match.` : '';

// Value must be a number greater than 0.
export const isPositiveNumber = (value, label = 'Value') => {
  const n = Number(value);
  if (value === '' || value == null) return `${label} is required.`;
  if (Number.isNaN(n) || n <= 0) return `${label} must be a number greater than 0.`;
  return '';
};

// Date must be in the future.
export const isFutureDate = (value, label = 'Date') => {
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return `${label} is required.`;
  if (d <= Date.now()) return `${label} must be in the future.`;
  return '';
};

// Run a map of { field: validatorFn } and return only the errors.
export const runValidators = (rules) => {
  const errors = {};
  for (const [field, validate] of Object.entries(rules)) {
    const message = validate();
    if (message) errors[field] = message;
  }
  return errors;
};
