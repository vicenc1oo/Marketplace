import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

/** Fire transient toasts: toast.success(msg) / toast.error(msg) / toast.info(msg). */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
