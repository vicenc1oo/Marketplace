import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Tabs from '../../components/Tabs/Tabs.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import Input from '../../components/Field/Input.jsx';
import Textarea from '../../components/Field/Textarea.jsx';
import ListingGrid from '../../components/ListingGrid/ListingGrid.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getUser, getUserListings, getReviews, updateProfile } from '../../services/user.service.js';
import { getFavorites } from '../../services/listing.service.js';
import { formatDate } from '../../utils/formatDate.js';
import { required, minLength, maxLength, runValidators } from '../../utils/validators.js';
import './Profile.css';

export default function Profile() {
  const { userId } = useParams();
  const { user: me, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('listings');
  const [editOpen, setEditOpen] = useState(false);

  const isOwn = me?.id === userId;

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getUser(userId), getUserListings(userId), getReviews(userId)])
      .then(([u, l, r]) => {
        if (!active) return;
        setProfile(u);
        setListings(l);
        setReviews(r);
      })
      .catch(() => active && setProfile(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [userId]);

  // Favorites are private, so only load them on your own profile.
  useEffect(() => {
    if (!isOwn) {
      setFavorites([]);
      if (tab === 'favorites') setTab('listings');
      return;
    }
    getFavorites().then(setFavorites).catch(() => setFavorites([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwn, userId]);

  if (loading) {
    return (
      <div className="container page" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page">
        <EmptyState icon="user" title="User not found" description="This profile doesn't exist or was removed." />
      </div>
    );
  }

  const tabs = [
    { id: 'listings', label: 'Listings', count: listings.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
    ...(isOwn ? [{ id: 'favorites', label: 'Favorites', count: favorites.length }] : []),
  ];

  return (
    <div className="container page profile">
      <header className="profile__head">
        <Avatar src={profile.avatarUrl} name={profile.name} size={88} showStatus online={profile.online} />
        <div className="profile__head-info">
          <h1 className="profile__name">{profile.name}</h1>
          <div className="profile__stats">
            <span><Icon name="star-filled" size={14} className="profile__star" /> {profile.rating} ({profile.reviewsCount} reviews)</span>
            <span><Icon name="location" size={14} /> {profile.location}</span>
            <span>Member since {formatDate(profile.memberSince)}</span>
          </div>
          {profile.bio && <p className="profile__bio">{profile.bio}</p>}
          <Badge variant={profile.online ? 'success' : 'neutral'}>
            {profile.online ? 'Online now' : 'Offline'}
          </Badge>
        </div>
        {isOwn && (
          <Button variant="secondary" onClick={() => setEditOpen(true)} className="profile__edit-btn">
            <Icon name="edit" size={16} /> Edit profile
          </Button>
        )}
      </header>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="profile__tabs" />

      {tab === 'listings' && (
        <ListingGrid
          listings={listings}
          empty={
            <EmptyState
              icon="tag"
              title={isOwn ? "You haven't listed anything yet" : 'No listings yet'}
              description={isOwn ? 'Your active listings will appear here.' : `${profile.name} has no active listings.`}
            />
          }
        />
      )}

      {tab === 'reviews' && (
        <div className="profile__reviews-layout">
          <div className="profile__reviews-main">
            {reviews.length === 0 ? (
              <EmptyState icon="star" title="No reviews yet" description="Reviews from buyers and sellers will show up here." />
            ) : (
              <ul className="profile__reviews">
                {reviews.map((r) => (
                  <li key={r.id} className="profile__review">
                    <Avatar src={r.author?.avatarUrl} name={r.author?.name} size={40} />
                    <div className="profile__review-body">
                      <div className="profile__review-top">
                        <span className="profile__review-author">{r.author?.name}</span>
                        <span className="profile__review-stars" aria-label={`${r.rating} out of 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icon key={i} name={i < r.rating ? 'star-filled' : 'star'} size={14} />
                          ))}
                        </span>
                      </div>
                      <p className="profile__review-text">{r.text}</p>
                      <span className="profile__review-date">{formatDate(r.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <RatingSummary rating={profile.rating} total={profile.reviewsCount} />
        </div>
      )}

      {tab === 'favorites' && (
        <ListingGrid
          listings={favorites}
          empty={
            <EmptyState
              icon="heart"
              title="No saved listings yet"
              description="Items you save will show up here so you can find them later."
              action={<Button as={Link} to="/marketplace">Browse listings</Button>}
            />
          }
        />
      )}

      {isOwn && (
        <EditProfileModal
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setProfile((p) => ({ ...p, ...updated }));
            updateUser(updated);
            toast.success('Profile updated');
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Spread `total` ratings across the two stars around the average (sums to total).
function ratingDistribution(total, rating) {
  const order = [5, 4, 3, 2, 1];
  const base = order.map((star) => ({ star, count: 0 }));
  if (total <= 0) return base;
  const low = Math.max(1, Math.floor(rating));
  const high = Math.min(5, low + 1);
  const set = (star, n) => { base.find((b) => b.star === star).count = n; };
  if (low === high || rating === low) {
    set(low, total);
  } else {
    const highCount = Math.round(total * (rating - low));
    set(high, highCount);
    set(low, total - highCount);
  }
  return base;
}

// Average score, star bars and total, shown beside the reviews list.
// Bars are derived from the total count + average so they always sum to `total`.
function RatingSummary({ rating = 0, total = 0 }) {
  const counts = ratingDistribution(total, rating);
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <aside className="rating-summary">
      <div className="rating-summary__score">
        <span className="rating-summary__avg">{rating.toFixed(1)}</span>
        <span className="rating-summary__stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name={i < Math.round(rating) ? 'star-filled' : 'star'} size={16} />
          ))}
        </span>
        <span className="rating-summary__total">{total} reviews</span>
      </div>
      <ul className="rating-summary__bars">
        {counts.map(({ star, count }) => (
          <li key={star} className="rating-summary__row">
            <span className="rating-summary__label">
              {star} <Icon name="star-filled" size={11} />
            </span>
            <span className="rating-summary__bar">
              <span style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="rating-summary__count">{count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function EditProfileModal({ open, profile, onClose, onSaved }) {
  const [form, setForm] = useState({ name: profile.name, bio: profile.bio || '', location: profile.location || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: profile.name, bio: profile.bio || '', location: profile.location || '' });
  }, [profile, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    const found = runValidators({
      name: () => required(form.name, 'Name') || minLength(form.name, 2, 'Name'),
      bio: () => maxLength(form.bio, 200, 'Bio'),
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save changes</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="Name" value={form.name} onChange={set('name')} error={errors.name} required />
        <Input label="Location" value={form.location} onChange={set('location')} />
        <Textarea label="Bio" hint="Up to 200 characters." value={form.bio} onChange={set('bio')} error={errors.bio} />
      </div>
    </Modal>
  );
}
