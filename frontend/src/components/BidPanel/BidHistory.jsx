import Avatar from '../Avatar/Avatar.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { timeAgo } from '../../utils/formatDate.js';
import './BidPanel.css';

// List of bids sorted by the latest
export default function BidHistory({ bids = [], currency = 'EUR' }) {
  if (!bids.length) {
    return (
      <EmptyState
        icon="gavel"
        title="No bids yet"
        description="Be the first to place a bid on this item."
      />
    );
  }

  return (
    <ul className="bid-history">
      {bids.map((bid, i) => (
        <li key={bid.id} className="bid-history__row">
          <Avatar src={bid.bidder?.avatarUrl} name={bid.bidder?.name} size={32} />
          <div className="bid-history__who">
            <span className="bid-history__name">{bid.bidder?.name || 'Bidder'}</span>
            <span className="bid-history__time">{timeAgo(bid.createdAt)}</span>
          </div>
          <span className={`bid-history__amount ${i === 0 ? 'is-top' : ''}`}>
            {formatPrice(bid.amount, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}
