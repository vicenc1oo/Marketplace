import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Avatar from '../../components/Avatar/Avatar.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Textarea from '../../components/Field/Textarea.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import BidPanel from '../../components/BidPanel/BidPanel.jsx';
import BidHistory from '../../components/BidPanel/BidHistory.jsx';
import Gallery from './Gallery.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { useSocket } from '../../hooks/useSocket.js';
import { getListing, toggleFavorite } from '../../services/listing.service.js';
import { getBids, placeBid } from '../../services/bidding.service.js';
import { startConversation } from '../../services/chat.service.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { formatDate, timeAgo } from '../../utils/formatDate.js';
import { conditionLabel } from '../../utils/constants.js';
import './ListingDetails.css';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { connected, emit, subscribe } = useSocket();

  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    getListing(id)
        .then((data) => {
          if (!active) return;
          setListing(data);
          if (data.type === 'auction') return getBids(id).then((b) => active && setBids(b));
          return undefined;
        })
        .catch(() => active && setNotFound(true))
        .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!connected) return undefined;

    emit('auction:join', id);
    const unsubscribe = subscribe('bid:placed', (bid) => {
      if (bid.listingId !== id) return;
      setBids((current) => (
          current.some((item) => item.id === bid.id) ? current : [bid, ...current]
      ));
      setListing((current) => current && ({
        ...current,
        currentBid: bid.currentBid,
        bidsCount: bid.bidsCount,
      }));
    });

    return () => {
      unsubscribe();
      emit('auction:leave', id);
    };
  }, [connected, emit, id, subscribe]);

  const onFavorite = async () => {
    if (!isAuthenticated) return navigate('/login');
    setSaved((s) => !s);
    try {
      const res = await toggleFavorite(id);
      setSaved(res.saved);
      toast.success(res.saved ? 'Saved to your favourites' : 'Removed from favourites');
    } catch {
      toast.error('Could not update favourites');
    }
  };

  const onPlaceBid = async (amount) => {
    if (!isAuthenticated) {
      navigate('/login');
      throw new Error('Please log in to bid.');
    }
    setPlacing(true);
    try {
      const bid = await placeBid(id, amount);
      setBids((prev) => (prev.some((item) => item.id === bid.id) ? prev : [bid, ...prev]));
      setListing((prev) => ({
        ...prev,
        currentBid: bid.currentBid,
        bidsCount: bid.bidsCount,
      }));
      toast.success('Bid placed!');
    } finally {
      setPlacing(false);
    }
  };

  const sendContact = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setContactSending(true);
    try {
      const conversation = await startConversation(listing.id, message.trim());
      toast.success(`Message sent to ${listing.seller?.name}`);
      setContactOpen(false);
      setMessage('');
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error(error.message || 'Could not send message.');
    } finally {
      setContactSending(false);
    }
  };

  if (loading) {
    return (
        <div className="container page" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
          <Spinner size={32} />
        </div>
    );
  }

  if (notFound || !listing) {
    return (
        <div className="container page">
          <EmptyState
              icon="tag"
              title="Listing not found"
              description="This listing may have been removed or sold."
              action={<Button as={Link} to="/marketplace">Back to marketplace</Button>}
          />
        </div>
    );
  }

  const isAuction = listing.type === 'auction';
  const isOwner = user?.id === listing.sellerId;

  return (
      <div className="container page details">
        <nav className="details__crumbs" aria-label="Breadcrumb">
          <Link to="/marketplace">Marketplace</Link>
          <Icon name="chevron-right" size={14} />
          <Link to={`/marketplace?category=${listing.category}`}>{listing.category}</Link>
        </nav>

        <div className="details__grid">
          <div className="details__main">
            <Gallery images={listing.images} title={listing.title} />

            <section className="details__block">
              <h2>Description</h2>
              <p className="details__description">{listing.description}</p>
            </section>

            {isAuction && (
                <section className="details__block">
                  <h2>Bid history</h2>
                  <BidHistory bids={bids} currency={listing.currency} />
                </section>
            )}

            <section className="details__safety">
              <h2 className="details__safety-title">
                <Icon name="shield" size={18} /> Stay safe when buying
              </h2>
              <ul className="details__safety-list">
                <li>Meet in a public place and inspect the item before paying.</li>
                <li>Pay in person once you have the item — avoid wire transfers and gift cards.</li>
                <li>Keep conversations and offers inside the app so there's a record.</li>
              </ul>
            </section>
          </div>

          <aside className="details__aside">
            <div className="details__summary">
              <div className="details__head">
                <h1 className="details__title">{listing.title}</h1>
                <button
                    type="button"
                    className={`details__fav ${saved ? 'is-saved' : ''}`}
                    onClick={onFavorite}
                    aria-pressed={saved}
                    aria-label={saved ? 'Remove from saved' : 'Save listing'}
                >
                  <Icon name={saved ? 'heart-filled' : 'heart'} />
                </button>
              </div>

              <div className="details__meta">
                <Badge variant="neutral">{conditionLabel(listing.condition)}</Badge>
                <span className="details__loc"><Icon name="location" size={14} /> {listing.location}</span>
                <span className="details__posted">Posted {timeAgo(listing.createdAt)}</span>
              </div>

              {isAuction ? (
                  <BidPanel
                      listing={listing}
                      bids={bids}
                      currentUserId={user?.id}
                      onPlaceBid={onPlaceBid}
                      placing={placing}
                  />
              ) : (
                  <div className="details__price-box">
                    <span className="details__price">{formatPrice(listing.price, listing.currency)}</span>
                    {!isOwner ? (
                        <Button fullWidth onClick={() => (isAuthenticated ? setContactOpen(true) : navigate('/login'))}>
                          <Icon name="message" size={18} /> Contact seller
                        </Button>
                    ) : (
                        <Button as={Link} to={`/listing/${listing.id}/edit`} variant="secondary" fullWidth>
                          <Icon name="edit" size={16} /> Edit listing
                        </Button>
                    )}
                  </div>
              )}
            </div>

            <Link to={`/profile/${listing.seller?.id}`} className="details__seller">
              <Avatar src={listing.seller?.avatarUrl} name={listing.seller?.name} size={48} showStatus online={listing.seller?.online} />
              <div className="details__seller-info">
                <span className="details__seller-name">{listing.seller?.name}</span>
                <span className="details__seller-meta">
                <Icon name="star-filled" size={13} /> {listing.seller?.rating} · {listing.seller?.reviewsCount} reviews
              </span>
                <span className="details__seller-since">Member since {formatDate(listing.seller?.memberSince)}</span>
              </div>
              <Icon name="chevron-right" size={18} />
            </Link>
          </aside>
        </div>

        <Modal
            open={contactOpen}
            onClose={() => setContactOpen(false)}
            title={`Message ${listing.seller?.name}`}
            footer={
              <>
                <Button variant="ghost" onClick={() => setContactOpen(false)}>Cancel</Button>
                <Button onClick={sendContact} loading={contactSending} disabled={!message.trim()}>Send message</Button>
              </>
            }
        >
          <p className="details__contact-context">About: <strong>{listing.title}</strong></p>
          <form onSubmit={sendContact}>
            <Textarea
                label="Your message"
                placeholder={`Hi, is this still available?`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
            />
          </form>
        </Modal>
      </div>
  );
}
