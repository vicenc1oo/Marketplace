import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingGrid from '../../components/ListingGrid/ListingGrid.jsx';
import Button from '../../components/Button/Button.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { getActiveAuctions } from '../../services/bidding.service.js';
import './Bidding.css';

// Browse active auctions. (Your own bids live on the Dashboard.)
export default function Bidding() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveAuctions().then(setAuctions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page bidding">
      <header className="page__header">
        <h1 className="page__title">Auctions</h1>
        <p className="page__subtitle">Bid on items before time runs out.</p>
      </header>

      <ListingGrid
        listings={auctions}
        loading={loading}
        empty={
          <EmptyState
            icon="gavel"
            title="No active auctions"
            description="There are no auctions running right now. Check back soon."
            action={<Button as={Link} to="/marketplace">Browse listings</Button>}
          />
        }
      />
    </div>
  );
}
