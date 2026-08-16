import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import ListingGrid from '../../components/ListingGrid/ListingGrid.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { SkeletonGrid } from '../../components/LoadingSkeleton/LoadingSkeleton.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getDashboardStats } from '../../services/analytics.service.js';
import { getUserListings } from '../../services/user.service.js';
import { getMyBids } from '../../services/bidding.service.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { timeRemaining } from '../../utils/formatDate.js';
import './Dashboard.css';

// Seller dashboard: your listings, your active bids, and subtle total views.
export default function Dashboard() {
  const { user } = useAuth();
  const [totalViews, setTotalViews] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);

  useEffect(() => {
    getDashboardStats().then((s) => setTotalViews(s.totalViews)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getUserListings(user.id).then(setListings).catch(() => {}).finally(() => setLoadingListings(false));
  }, [user?.id]);

  useEffect(() => {
    getMyBids().then(setBids).catch(() => {}).finally(() => setLoadingBids(false));
  }, []);

  return (
    <div className="container page dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="page__title">Hi, {user?.name?.split(' ')[0] || 'there'}!</h1>
          <p className="page__subtitle">
            Manage your listings and bids.
            {totalViews != null && (
              <span className="dashboard__views"> · {totalViews.toLocaleString()} total views</span>
            )}
          </p>
        </div>
        <Button as={Link} to="/sell"><Icon name="plus" size={16} /> New listing</Button>
      </header>

      <section className="dashboard__section">
        <div className="section-head">
          <h2>Your listings</h2>
          <Link to={`/profile/${user?.id}`} className="section-head__link">
            View profile <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        <ListingGrid
          listings={listings}
          loading={loadingListings}
          skeletonCount={4}
          empty={
            <EmptyState
              icon="tag"
              title="No listings yet"
              description="Create your first listing and it'll show up here."
              action={<Button as={Link} to="/sell">Create a listing</Button>}
            />
          }
        />
      </section>

      <section className="dashboard__section">
        <div className="section-head">
          <h2>Your active bids</h2>
          <Link to="/bidding" className="section-head__link">
            Browse auctions <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        {loadingBids ? (
          <SkeletonGrid count={3} />
        ) : bids.length === 0 ? (
          <EmptyState
            icon="gavel"
            title="No active bids"
            description="Bid on an auction and it'll show up here so you can track it."
            action={<Button as={Link} to="/bidding">See auctions</Button>}
          />
        ) : (
          <ul className="dashboard__bids">
            {bids.map((entry) => {
              const remaining = timeRemaining(entry.listing.endsAt);
              return (
                <li key={entry.id} className="dashboard__bid">
                  <Link to={`/marketplace/${entry.listing.id}`} className="dashboard__bid-main">
                    <img src={entry.listing.images?.[0]} alt="" className="dashboard__bid-thumb" />
                    <div className="dashboard__bid-info">
                      <span className="dashboard__bid-title">{entry.listing.title}</span>
                      <span className="dashboard__bid-meta">
                        Your bid {formatPrice(entry.amount, entry.listing.currency)} ·
                        {' '}Current {formatPrice(entry.listing.currentBid, entry.listing.currency)}
                      </span>
                      <span className="dashboard__bid-time">{remaining.label}</span>
                    </div>
                  </Link>
                  {remaining.ended ? (
                    <Badge variant={entry.winning ? 'success' : 'neutral'}>{entry.winning ? 'Won' : 'Ended'}</Badge>
                  ) : entry.winning ? (
                    <Badge variant="success"><Icon name="check" size={12} /> Winning</Badge>
                  ) : (
                    <Badge variant="danger">Outbid</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
