import Icon from '../Icon/Icon.jsx';
import './Pagination.css';

// Page navigation; hidden when there is only one page.

// Build the visible page numbers around the current page.
function pageWindow(current, total, span = 1) {
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= span; i++) {
    pages.add(Math.max(1, current - i));
    pages.add(Math.min(total, current + i));
  }
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={18} />
      </button>

      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="pagination__group">
            {gap && <span className="pagination__ellipsis">…</span>}
            <button
              type="button"
              className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={18} />
      </button>
    </nav>
  );
}
