import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import Button from '../../components/Button/Button.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Select from '../../components/Field/Select.jsx';
import ConfirmDialog from '../../components/Modal/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useCurrency } from '../../hooks/useCurrency.js';
import { useToast } from '../../hooks/useToast.js';
import { getPromotionPackages, promoteListing } from '../../services/promotion.service.js';
import { getUserListings } from '../../services/user.service.js';
import { formatCredits } from '../../utils/formatPrice.js';
import './Promotions.css';

// Promote a listing with virtual credits: pick a listing and a package.
export default function Promotions() {
  const { user } = useAuth();
  const { balance, refresh } = useCurrency();
  const toast = useToast();

  const [packages, setPackages] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState('');
  const [pending, setPending] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getPromotionPackages().then(setPackages).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getUserListings(user.id)
      .then((all) => setListings(all.filter((l) => l.status === 'active')))
      .catch(() => {});
  }, [user?.id]);

  const confirmPromotion = async () => {
    if (!pending) return;
    setProcessing(true);
    try {
      await promoteListing(selectedListing, pending.id);
      await refresh();
      toast.success(`“${pending.name}” applied to your listing.`);
      setPending(null);
    } catch (err) {
      toast.error(err.message || 'Could not complete the promotion.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container page promotions">
      <header className="page__header">
        <h1 className="page__title">Promote a listing</h1>
        <p className="page__subtitle">
          Boost visibility and sell faster. You have <strong>{formatCredits(balance)}</strong>.{' '}
          <Link to="/wallet" className="promotions__wallet-link">View wallet</Link>
        </p>
      </header>

      {listings.length === 0 ? (
        <EmptyState
          icon="rocket"
          title="No active listings to promote"
          description="Create a listing first, then come back to give it a boost."
          action={<Button as={Link} to="/sell">Create a listing</Button>}
        />
      ) : (
        <>
          <div className="promotions__picker">
            <Select
              label="Choose a listing"
              placeholder="Select one of your listings"
              value={selectedListing}
              onChange={(e) => setSelectedListing(e.target.value)}
              options={listings.map((l) => ({ value: l.id, label: l.title }))}
            />
          </div>

          <div className="promotions__packages">
            {packages.map((pkg) => {
              const affordable = balance >= pkg.credits;
              return (
                <div key={pkg.id} className="promotions__card">
                  <div className="promotions__card-head">
                    <span className="promotions__card-icon"><Icon name="rocket" size={20} /></span>
                    <Badge variant="accent">{formatCredits(pkg.credits)}</Badge>
                  </div>
                  <h2 className="promotions__card-name">{pkg.name}</h2>
                  <p className="promotions__card-desc">{pkg.description}</p>
                  <Button
                    variant="accent"
                    fullWidth
                    disabled={!selectedListing || !affordable}
                    onClick={() => setPending(pkg)}
                  >
                    {!affordable ? 'Not enough credits' : 'Promote'}
                  </Button>
                  {!selectedListing && <p className="promotions__hint">Select a listing first</p>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={confirmPromotion}
        loading={processing}
        title="Confirm promotion"
        message={pending ? `Spend ${formatCredits(pending.credits)} to apply “${pending.name}”? This can't be undone.` : ''}
        confirmLabel="Confirm & spend"
        variant="accent"
      />
    </div>
  );
}
