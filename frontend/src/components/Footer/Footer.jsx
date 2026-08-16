import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import './Footer.css';

// Site footer with Privacy/Terms links and logo branding.
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo-link">
            <img src={logo} alt="BidHub logo" className="footer__logo-img" />
            <span className="footer__logo-text">BidHub</span>
          </Link>
          <p className="footer__tagline">
            The modern marketplace to buy, sell, and bid on second-hand items in your local community.
          </p>
        </div>

        <nav className="footer__col" aria-label="Explore">
          <h3 className="footer__heading">Explore</h3>
          <Link to="/marketplace">Browse listings</Link>
          <Link to="/bidding">Live Auctions</Link>
          <Link to="/sell">Sell an Item</Link>
        </nav>

        <nav className="footer__col" aria-label="Account">
          <h3 className="footer__heading">Account</h3>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/chat">Messages</Link>
          <Link to="/wallet">Wallet</Link>
        </nav>

        <nav className="footer__col" aria-label="Legal">
          <h3 className="footer__heading">Legal & Info</h3>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </div>

      <div className="container footer__bottom">
        <span>© {year} BidHub. All rights reserved.</span>
        <span className="footer__badge">Fast · Safe · Local</span>
      </div>
    </footer>
  );
}

