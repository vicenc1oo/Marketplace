import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/Field/Input.jsx';
import Textarea from '../../components/Field/Textarea.jsx';
import Select from '../../components/Field/Select.jsx';
import Button from '../../components/Button/Button.jsx';
import ImageUploader from '../../components/ImageUploader/ImageUploader.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../hooks/useToast.js';
import * as listingService from '../../services/listing.service.js';
import { CONDITIONS, LISTING_TYPES } from '../../utils/constants.js';
import {
  required,
  minLength,
  maxLength,
  isPositiveNumber,
  isFutureDate,
  runValidators,
} from '../../utils/validators.js';
import './CreateListing.css';

const EMPTY = {
  title: '',
  description: '',
  category: '',
  price: '',
  condition: '',
  location: '',
  type: 'fixed',
  endsAt: '',
  images: [],
};

// Create or edit a listing (same form); auction fields appear for bidding type.
export default function CreateListing() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    listingService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    listingService
      .getListing(id)
      .then((l) => {
        if (!active) return;
        setForm({
          title: l.title || '',
          description: l.description || '',
          category: l.category || '',
          price: String(l.type === 'auction' ? l.startingBid ?? '' : l.price ?? ''),
          condition: l.condition || '',
          location: l.location || '',
          type: l.type || 'fixed',
          endsAt: l.endsAt ? l.endsAt.slice(0, 16) : '',
          images: l.images || [],
        });
      })
      .catch(() => toast.error('Could not load this listing.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEdit, toast]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const isAuction = form.type === 'auction';

  const validate = () =>
    runValidators({
      title: () => required(form.title, 'Title') || maxLength(form.title, 80, 'Title'),
      description: () => required(form.description, 'Description') || minLength(form.description, 20, 'Description'),
      category: () => required(form.category, 'Category'),
      price: () => isPositiveNumber(form.price, isAuction ? 'Starting bid' : 'Price'),
      condition: () => required(form.condition, 'Condition'),
      location: () => required(form.location, 'Location'),
      images: () => (form.images.length ? '' : 'Add at least one photo.'),
      ...(isAuction ? { endsAt: () => isFutureDate(form.endsAt, 'End date') } : {}),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      condition: form.condition,
      location: form.location.trim(),
      type: form.type,
      images: form.images,
      ...(isAuction
        ? { startingBid: Number(form.price), currentBid: Number(form.price), endsAt: new Date(form.endsAt).toISOString() }
        : { price: Number(form.price) }),
    };

    setSubmitting(true);
    try {
      const result = isEdit
        ? await listingService.updateListing(id, payload)
        : await listingService.createListing(payload);
      toast.success(isEdit ? 'Listing updated.' : 'Listing published!');
      navigate(`/marketplace/${result.id}`);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="container page create">
      <header className="page__header">
        <h1 className="page__title">{isEdit ? 'Edit listing' : 'Sell an item'}</h1>
        <p className="page__subtitle">
          {isEdit ? 'Update the details below.' : 'Add a few clear photos and an honest description — it sells faster.'}
        </p>
      </header>

      <form className="create__form" onSubmit={handleSubmit} noValidate>
        <section className="create__section">
          <h2 className="create__legend">Photos</h2>
          <ImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
          {errors.images && <p className="create__error" role="alert">{errors.images}</p>}
        </section>

        <section className="create__section">
          <h2 className="create__legend">Details</h2>
          <Input
            label="Title"
            placeholder="e.g. Vintage road bike, 54cm frame"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
            maxLength={80}
            required
          />
          <Textarea
            label="Description"
            placeholder="Describe the item, its condition, and any details a buyer should know."
            value={form.description}
            onChange={set('description')}
            error={errors.description}
            required
          />
          <div className="create__row">
            <Select
              label="Category"
              placeholder="Choose a category"
              value={form.category}
              onChange={set('category')}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              error={errors.category}
              required
            />
            <Select
              label="Condition"
              placeholder="Select condition"
              value={form.condition}
              onChange={set('condition')}
              options={CONDITIONS}
              error={errors.condition}
              required
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g. Lisbon"
            value={form.location}
            onChange={set('location')}
            error={errors.location}
            required
          />
        </section>

        <section className="create__section">
          <h2 className="create__legend">Pricing</h2>
          <div className="create__row">
            <Select
              label="Listing type"
              value={form.type}
              onChange={set('type')}
              options={LISTING_TYPES}
            />
            <Input
              label={isAuction ? 'Starting bid (€)' : 'Price (€)'}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={form.price}
              onChange={set('price')}
              error={errors.price}
              required
            />
          </div>
          {isAuction && (
            <Input
              label="Auction ends"
              type="datetime-local"
              value={form.endsAt}
              onChange={set('endsAt')}
              error={errors.endsAt}
              required
            />
          )}
        </section>

        <div className="create__actions">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
