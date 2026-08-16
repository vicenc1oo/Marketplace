// Shared UI enums for conditions, listing types and sort options.

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for_parts', label: 'For parts' },
];

export const LISTING_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'auction', label: 'Bidding' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
];

// Human label for a condition value.
export const conditionLabel = (value) =>
  CONDITIONS.find((c) => c.value === value)?.label || value;
