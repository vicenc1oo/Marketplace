import { Link } from 'react-router-dom';
import './Auth.css';
import logo from "../../images/logo.png";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__card">
        <Link to="/" className="auth__brand">
            <img src={logo} alt="BidHub" className="navbar__logo-mark" />
            <span className="navbar__logo-text">BidHub</span>
        </Link>
        <h1 className="auth__title">{title}</h1>
        {subtitle && <p className="auth__subtitle">{subtitle}</p>}
        {children}
      </div>
      {footer && <p className="auth__footer">{footer}</p>}
    </div>
  );
}
