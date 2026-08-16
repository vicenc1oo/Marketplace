import Select from '../Field/Select.jsx';
import Input from '../Field/Input.jsx';
import Button from '../Button/Button.jsx';
import { CONDITIONS, LISTING_TYPES } from '../../utils/constants.js';
import './FilterSidebar.css';

// Controlled marketplace filters; each change calls onChange with a partial patch.
export default function FilterSidebar({ filters, onChange, categories = [], onClear }) {
  const set = (patch) => onChange(patch);
  const hasActive = Object.entries(filters).some(
    ([k, v]) => !['sort', 'page'].includes(k) && v !== '' && v != null,
  );

  return (
    <aside className="filters" aria-label="Filters">
      <div className="filters__head">
        <h2 className="filters__title">Filters</h2>
        {hasActive && (
          <button type="button" className="filters__clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <Select
        label="Category"
        placeholder="All categories"
        value={filters.category || ''}
        onChange={(e) => set({ category: e.target.value })}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />

      <Input
        label="Location"
        placeholder="Any location"
        value={filters.location || ''}
        onChange={(e) => set({ location: e.target.value })}
      />

      <fieldset className="filters__group">
        <legend className="field__label">Price range (€)</legend>
        <div className="filters__row">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.minPrice || ''}
            onChange={(e) => set({ minPrice: e.target.value })}
          />
          <span className="filters__dash" aria-hidden="true">–</span>
          <Input
            type="number"
            min="0"
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.maxPrice || ''}
            onChange={(e) => set({ maxPrice: e.target.value })}
          />
        </div>
      </fieldset>

      <Select
        label="Condition"
        placeholder="Any condition"
        value={filters.condition || ''}
        onChange={(e) => set({ condition: e.target.value })}
        options={CONDITIONS}
      />

      <Select
        label="Listing type"
        placeholder="Fixed price & bidding"
        value={filters.type || ''}
        onChange={(e) => set({ type: e.target.value })}
        options={LISTING_TYPES}
      />

      {hasActive && (
        <Button variant="ghost" fullWidth onClick={onClear} className="filters__clear-btn">
          Clear filters
        </Button>
      )}
    </aside>
  );
}
