import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../Spinner/Spinner.jsx';
import { useAuth } from '../../hooks/useAuth.js';

// Guards authenticated routes; redirects to /login, preserving the target.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
