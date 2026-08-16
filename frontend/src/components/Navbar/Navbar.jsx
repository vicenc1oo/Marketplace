import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import Avatar from '../Avatar/Avatar.jsx';
import Button from '../Button/Button.jsx';
import SearchBar from '../SearchBar/SearchBar.jsx';
import NotificationBell from '../NotificationBell/NotificationBell.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import logo from '../../images/logo.png';
import './Navbar.css';

/* Top navigation: search, auth-aware menu, theme toggle, mobile drawer.
   Developed by: mde-maga • mateferr • mprazere • psantos- */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const goSearch = (q) => {
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace');
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt="BidHub" className="navbar__logo-mark" />
          <span className="navbar__logo-text">BidHub</span>
        </Link>

        <div className="navbar__search">
          <SearchBar onSubmit={goSearch} placeholder="Search listings…" />
        </div>

        <nav className="navbar__actions" aria-label="Primary">
          <button
            type="button"
            className="navbar__theme"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          <Button as={Link} to="/sell" variant="primary" size="sm" className="navbar__sell">
            <Icon name="plus" size={16} />
            <span className="navbar__sell-text">Sell</span>
          </Button>

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="navbar__menu" ref={menuRef}>
                <button
                  type="button"
                  className="navbar__avatar-btn"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                >
                  <Avatar src={user?.avatarUrl} name={user?.name} size={36} />
                </button>
                {menuOpen && (
                  <div className="navbar__dropdown" role="menu" onClick={() => setMenuOpen(false)}>
                    <div className="navbar__dropdown-head">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <Link to="/dashboard" role="menuitem"><Icon name="home" size={16} /> Dashboard</Link>
                    <Link to={`/profile/${user?.id}`} role="menuitem"><Icon name="user" size={16} /> Profile</Link>
                    <Link to="/chat" role="menuitem"><Icon name="message" size={16} /> Messages</Link>
                    <Link to="/bidding" role="menuitem"><Icon name="gavel" size={16} /> Auctions</Link>
                    <Link to="/wallet" role="menuitem"><Icon name="wallet" size={16} /> Wallet</Link>
                    <button type="button" role="menuitem" onClick={logout} className="navbar__logout">
                      <Icon name="arrow-right" size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar__auth">
              <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
              <Button as={Link} to="/register" variant="secondary" size="sm">Sign up</Button>
            </div>
          )}

          <button
            type="button"
            className="navbar__hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile">
          <div className="container navbar__mobile-inner">
            <SearchBar onSubmit={goSearch} placeholder="Search listings…" />
            <NavLink to="/marketplace" onClick={() => setMobileOpen(false)}>Browse</NavLink>
            <NavLink to="/bidding" onClick={() => setMobileOpen(false)}>Auctions</NavLink>
            <NavLink to="/sell" onClick={() => setMobileOpen(false)}>Sell an item</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
                <NavLink to="/chat" onClick={() => setMobileOpen(false)}>Messages</NavLink>
                <NavLink to="/wallet" onClick={() => setMobileOpen(false)}>Wallet</NavLink>
                <button type="button" onClick={() => { logout(); setMobileOpen(false); }}>Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMobileOpen(false)}>Log in</NavLink>
                <NavLink to="/register" onClick={() => setMobileOpen(false)}>Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
