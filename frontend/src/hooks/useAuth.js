import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/** Access the auth state and actions. Must be used under <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
