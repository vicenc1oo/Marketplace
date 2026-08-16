import './Spinner.css';

/** Indeterminate loading spinner with an accessible label. */
export default function Spinner({ size = 24, label = 'Loading', className = '' }) {
  return (
    <span className={`spinner ${className}`} role="status" aria-live="polite">
      <span className="spinner__circle" style={{ width: size, height: size }} />
      <span className="sr-only">{label}…</span>
    </span>
  );
}
