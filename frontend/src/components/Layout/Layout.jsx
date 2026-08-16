import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';
import './Layout.css';

// Shared page frame: skip link, navbar, routed page, footer.
export default function Layout() {
  return (
    <div className="layout">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
