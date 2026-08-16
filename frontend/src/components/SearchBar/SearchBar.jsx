import { useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import './SearchBar.css';

// Search input; controlled (value + onChange) or uncontrolled with onSubmit.
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for anything…',
  size = 'md',
  autoFocus = false,
}) {
  const [internal, setInternal] = useState('');
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  const update = (v) => {
    if (controlled) onChange?.(v);
    else setInternal(v);
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(current.trim());
  };

  return (
    <form className={`searchbar searchbar--${size}`} role="search" onSubmit={submit}>
      <Icon name="search" size={18} className="searchbar__icon" />
      <input
        type="search"
        className="searchbar__input"
        placeholder={placeholder}
        value={current}
        onChange={(e) => update(e.target.value)}
        aria-label="Search listings"
        autoFocus={autoFocus}
      />
      {current && (
        <button
          type="button"
          className="searchbar__clear"
          onClick={() => update('')}
          aria-label="Clear search"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </form>
  );
}
