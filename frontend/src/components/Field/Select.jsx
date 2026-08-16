import { useId } from 'react';
import Icon from '../Icon/Icon.jsx';
import './field.css';

// Labelled select; options are [{ value, label }] with an optional placeholder.
export default function Select({
  label,
  error,
  hint,
  id,
  required,
  options = [],
  placeholder,
  className = '',
  ...rest
}) {
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
      <div className="field__select-wrap">
        <select
          id={fieldId}
          className={`field__control ${error ? 'field__control--error' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          required={required}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={18} className="field__select-icon" />
      </div>
      {error && <span className="field__error" id={errorId} role="alert">{error}</span>}
    </div>
  );
}
