import ListingCard from '../ListingCard/ListingCard.jsx';
import { SkeletonGrid } from '../LoadingSkeleton/LoadingSkeleton.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import './ListingGrid.css';

// Responsive grid of ListingCards that owns the loading and empty states.
export default function ListingGrid({
  listings = [],
  loading = false,
  skeletonCount = 8,
  savedIds,
  onFavorite,
  empty,
}) {
  if (loading) return <SkeletonGrid count={skeletonCount} />;

  if (!listings.length) {
    return (
      empty || (
        <EmptyState
          icon="tag"
          title="Nothing here yet"
          description="There are no listings to show right now."
        />
      )
    );
  }

  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          saved={savedIds?.has?.(listing.id)}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
}
