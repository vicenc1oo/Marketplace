import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import ListingGrid from '../../components/ListingGrid/ListingGrid.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import Select from '../../components/Field/Select.jsx';
import Button from '../../components/Button/Button.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Pagination from '../../components/Pagination/Pagination.jsx';
import { useListings } from '../../hooks/useListings.js';
import { getCategories, toggleFavorite } from '../../services/listing.service.js';
import { SORT_OPTIONS } from '../../utils/constants.js';
import './Marketplace.css';

const FILTER_KEYS = ['q', 'category', 'location', 'minPrice', 'maxPrice', 'condition', 'type', 'sort'];

// Browse and filter listings; filters live in the URL so views are shareable.
export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Build the params object the hook/service expect from the URL.
  const params = useMemo(() => {
    const obj = { page: Number(searchParams.get('page')) || 1, limit: 12 };
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  const { items, total, page, totalPages, loading } = useListings(params);

  const updateParams = (patch, { resetPage = true } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === '' || value == null) next.delete(key);
          else next.set(key, value);
        });
        if (resetPage) next.delete('page');
        return next;
      },
      // Replace history so typing/filtering doesn't flood the back button.
      { replace: true },
    );
  };

  const clearFilters = () => setSearchParams({});

  const onFavorite = async (id) => {
    // Optimistic toggle; reconcile with the service result.
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const { saved } = await toggleFavorite(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        saved ? next.add(id) : next.delete(id);
        return next;
      });
    } catch {
      /* leave optimistic state in mock mode */
    }
  };

  const activeQuery = params.q;

  return (
    <div className="container page marketplace">
      <div className="marketplace__top">
        <SearchBar
          value={activeQuery || ''}
          onChange={(v) => updateParams({ q: v })}
          onSubmit={(v) => updateParams({ q: v })}
          placeholder="Search listings…"
        />
      </div>

      <div className="marketplace__layout">
        <div className="marketplace__sidebar">
          <FilterSidebar
            filters={params}
            categories={categories}
            onChange={(patch) => updateParams(patch)}
            onClear={clearFilters}
          />
        </div>

        <div className="marketplace__content">
          <div className="marketplace__toolbar">
            <p className="marketplace__count" aria-live="polite">
              {loading ? 'Loading…' : `${total} ${total === 1 ? 'result' : 'results'}`}
              {activeQuery && !loading && <> for “{activeQuery}”</>}
            </p>
            <div className="marketplace__toolbar-right">
              <Button
                variant="secondary"
                size="sm"
                className="marketplace__filter-btn"
                onClick={() => setShowFilters(true)}
              >
                <Icon name="filter" size={16} /> Filters
              </Button>
              <Select
                aria-label="Sort by"
                value={params.sort || 'recent'}
                onChange={(e) => updateParams({ sort: e.target.value })}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          <ListingGrid
            listings={items}
            loading={loading}
            savedIds={savedIds}
            onFavorite={onFavorite}
            empty={
              <EmptyState
                icon="search"
                title="No listings match your filters"
                description="Try widening your search, removing a filter, or browsing a different category."
                action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
              />
            }
          />

          {!loading && totalPages > 1 && (
            <div className="marketplace__pagination">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => updateParams({ page: p }, { resetPage: false })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters live in a modal so the grid gets full width on phones. */}
      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filters" size="sm">
        <FilterSidebar
          filters={params}
          categories={categories}
          onChange={(patch) => updateParams(patch)}
          onClear={clearFilters}
        />
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button fullWidth onClick={() => setShowFilters(false)}>Show results</Button>
        </div>
      </Modal>
    </div>
  );
}
