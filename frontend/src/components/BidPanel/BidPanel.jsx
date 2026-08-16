import { useEffect, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import Badge from '../Badge/Badge.jsx';
import Button from '../Button/Button.jsx';
import Input from '../Field/Input.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { timeRemaining } from '../../utils/formatDate.js';
import { isPositiveNumber } from '../../utils/validators.js';
import './BidPanel.css';

// Auction control: bid form + validation, a live countdown, and bidder status.
export default function BidPanel({ listing, bids = [], currentUserId, onPlaceBid, placing = false }) {
  const [remaining, setRemaining] = useState(() => timeRemaining(listing.endsAt));
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const id = setInterval(() => setRemaining(timeRemaining(listing.endsAt)), 1000);
    return () => clearInterval(id);
  }, [listing.endsAt]);

  const currentBid = listing.currentBid ?? listing.startingBid;
  const minNext = currentBid + 1;
  const topBid = bids[0];
  const myTopBid = bids.find((b) => b.bidderId === currentUserId);

  let status = 'none';
  if (remaining.ended) status = 'ended';
  else if (topBid && topBid.bidderId === currentUserId) status = 'winning';
  else if (myTopBid) status = 'outbid';

  const statusBadge = {
    winning: <Badge variant="success"><Icon name="check" size={12} /> You're winning</Badge>,
    outbid: <Badge variant="danger">You've been outbid</Badge>,
    ended: <Badge variant="neutral">Auction ended</Badge>,
    none: <Badge variant="info">No bids yet — be the first</Badge>,
  }[status];

  const submit = async (e) => {
    e.preventDefault();
    const validation = isPositiveNumber(amount, 'Bid') || (Number(amount) < minNext ? `Bid must be at least ${formatPrice(minNext, listing.currency)}.` : '');
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    try {
      await onPlaceBid(Number(amount));
      setAmount('');
    } catch (err) {
      setError(err.message || 'Could not place bid.');
    }
  };

  return (
    <div className="bid-panel">
      <div className="bid-panel__top">
        <div>
          <span className="bid-panel__label">{listing.type === 'auction' ? 'Current bid' : 'Price'}</span>
          <div className="bid-panel__amount">{formatPrice(currentBid, listing.currency)}</div>
          <span className="bid-panel__count">{listing.bidsCount ?? bids.length} bids</span>
        </div>
        <div className={`bid-panel__time ${remaining.ended ? 'is-ended' : ''}`}>
          <Icon name="gavel" size={16} />
          <span>{remaining.label}</span>
        </div>
      </div>

      <div className="bid-panel__status">{statusBadge}</div>

      {!remaining.ended ? (
        <form className="bid-panel__form" onSubmit={submit} noValidate>
          <Input
            type="number"
            min={minNext}
            step="1"
            label={`Your bid (min ${formatPrice(minNext, listing.currency)})`}
            placeholder={String(minNext)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error}
          />
          <Button type="submit" loading={placing} fullWidth>
            Place bid
          </Button>
        </form>
      ) : (
        <p className="bid-panel__closed">
          This auction has closed{topBid ? ` at ${formatPrice(topBid.amount, listing.currency)}.` : '.'}
        </p>
      )}
    </div>
  );
}
