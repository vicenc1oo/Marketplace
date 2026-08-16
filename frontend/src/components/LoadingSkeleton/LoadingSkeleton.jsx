import './LoadingSkeleton.css';

// Shimmer placeholders shown while data loads.
export function Skeleton({ width, height = 16, radius = 'var(--radius-sm)', className = '', style }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton height={180} radius="var(--radius-md)" />
      <div className="skeleton-card__body">
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={16} />
        <Skeleton width="80%" height={14} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid" role="status" aria-label="Loading listings">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
