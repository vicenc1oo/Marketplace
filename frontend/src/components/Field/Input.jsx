import { useId } from 'react';
import './field.css';

// Labelled text input with accessible error/hint wiring.
export default function Input({ label, error, hint, id, required, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {hint && <span className="field__hint" id={hintId}>{hint}</span>}
      <input
        id={inputId}
        className={`field__control ${error ? 'field__control--error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        required={required}
        {...rest}
      />
      {error && <span className="field__error" id={errorId} role="alert">{error}</span>}
    </div>
  );
}
