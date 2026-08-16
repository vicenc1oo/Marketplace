import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import Badge from '../Badge/Badge.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { timeRemaining } from '../../utils/formatDate.js';
import { conditionLabel } from '../../utils/constants.js';
import './ListingCard.css';

// Listing card for fixed-price and auction items; optional favourite button.
export default function ListingCard({ listing, saved = false, onFavorite }) {
  const isAuction = listing.type === 'auction';
  const price = isAuction ? listing.currentBid ?? listing.startingBid : listing.price;
  const remaining = isAuction ? timeRemaining(listing.endsAt) : null;
  const cover = listing.images?.[0];

  const handleFavorite = (e) => {
    e.preventDefault();
    onFavorite?.(listing.id);
  };

  return (
    <article className="listing-card">
      <Link to={`/marketplace/${listing.id}`} className="listing-card__link">
        <div className="listing-card__media">
          {cover ? (
            <img className="listing-card__img" src={cover} alt={listing.title} loading="lazy" />
          ) : (
            <div className="listing-card__img listing-card__img--empty">
              <Icon name="image" size={28} />
            </div>
          )}
          {isAuction && (
            <Badge variant={remaining.ended ? 'neutral' : 'accent'} className="listing-card__type">
              <Icon name="gavel" size={12} /> {remaining.ended ? 'Ended' : remaining.label}
            </Badge>
          )}
          {onFavorite && (
            <button
              type="button"
              className={`listing-card__fav ${saved ? 'is-saved' : ''}`}
              onClick={handleFavorite}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved' : 'Save listing'}
            >
              <Icon name={saved ? 'heart-filled' : 'heart'} size={18} />
            </button>
          )}
        </div>

        <div className="listing-card__body">
          <div className="listing-card__price">
            {formatPrice(price, listing.currency)}
            {isAuction && <span className="listing-card__bid-note">current bid</span>}
          </div>
          <h3 className="listing-card__title">{listing.title}</h3>
          <div className="listing-card__meta">
            <span className="listing-card__location">
              <Icon name="location" size={14} /> {listing.location}
            </span>
            <Badge variant="neutral">{conditionLabel(listing.condition)}</Badge>
          </div>
        </div>
      </Link>
    </article>
  );
}
