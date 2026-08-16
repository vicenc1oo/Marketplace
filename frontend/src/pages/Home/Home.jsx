import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import ListingGrid from '../../components/ListingGrid/ListingGrid.jsx';
import Button from '../../components/Button/Button.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import * as listingService from '../../services/listing.service.js';
import './Home.css';

// Landing page: search, category shortcuts, featured and recent listings, sell CTA.
export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      listingService.getCategories(),
      listingService.getFeatured(),
      listingService.getRecent(),
    ])
      .then(([cats, feat, rec]) => {
        if (!active) return;
        setCategories(cats);
        setFeatured(feat);
        setRecent(rec);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const onSearch = (q) => navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace');

  return (
    <div className="home">
      <section className="home__hero">
        <div className="container home__hero-container">
          <div className="home__badge">
            <Icon name="sparkles" size={16} />
            <span>Welcome to BidHub Local Marketplace</span>
          </div>

          <h1 className="home__title">
            Find extraordinary deals, <span className="home__title-accent">right near you.</span>
          </h1>
          <p className="home__subtitle">
            Buy, sell, and place live bids on quality items from trusted sellers in your community.
          </p>

          <div className="home__search">
            <SearchBar size="lg" onSubmit={onSearch} placeholder="What are you looking to buy or bid on?" />
          </div>

          <div className="home__quick-tags">
            <span className="home__tag-label">Popular:</span>
            <button type="button" className="home__tag-pill" onClick={() => onSearch('Electronics')}>Electronics</button>
            <button type="button" className="home__tag-pill" onClick={() => onSearch('Furniture')}>Furniture</button>
            <button type="button" className="home__tag-pill" onClick={() => onSearch('Vehicles')}>Vehicles</button>
            <button type="button" className="home__tag-pill" onClick={() => onSearch('Gaming')}>Gaming</button>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="home__categories" aria-label="Categories">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/marketplace?category=${cat.id}`} className="home__category">
              <span className="home__category-icon">
                <Icon name={cat.icon} size={22} />
              </span>
              <span className="home__category-name">{cat.name}</span>
            </Link>
          ))}
        </section>

        <section className="home__section">
          <div className="section-head">
            <div>
              <h2>Featured listings</h2>
              <p className="section-head__sub">Handpicked top quality items available now</p>
            </div>
            <Link to="/marketplace?sort=popular" className="section-head__link">
              See all <Icon name="arrow-right" size={15} />
            </Link>
          </div>
          <ListingGrid listings={featured} loading={loading} skeletonCount={4} />
        </section>

        <section className="home__section">
          <div className="section-head">
            <div>
              <h2>Recently added</h2>
              <p className="section-head__sub">Fresh items listed by sellers in the past 24 hours</p>
            </div>
            <Link to="/marketplace" className="section-head__link">
              Browse all <Icon name="arrow-right" size={15} />
            </Link>
          </div>
          <ListingGrid listings={recent} loading={loading} skeletonCount={8} />
        </section>

        <section className="home__cta">
          <div className="home__cta-content">
            <span className="home__cta-badge">Earn extra cash</span>
            <h2>Have something to sell or auction?</h2>
            <p>List your item for free in under 2 minutes and connect with local buyers instantly.</p>
          </div>
          <Button as={Link} to="/sell" size="lg" variant="primary" className="home__cta-btn">
            <Icon name="plus" size={20} /> Post Your Listing Now
          </Button>
        </section>
      </div>
    </div>
  );
}

