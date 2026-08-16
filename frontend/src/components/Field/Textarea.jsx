import { useId } from 'react';
import './field.css';

/** Labelled multi-line input, same error/hint wiring as Input. */
export default function Textarea({ label, error, hint, id, required, className = '', ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={fieldId}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {hint && <span className="field__hint" id={hintId}>{hint}</span>}
      <textarea
        id={fieldId}
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
