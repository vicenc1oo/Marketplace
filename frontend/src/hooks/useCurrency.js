import { useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext.jsx';

/** Access the virtual-credit wallet (balance / refresh). */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
