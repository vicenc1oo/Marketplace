import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as currencyService from '../services/currency.service.js';
import { AuthContext } from './AuthContext.jsx';

// Exposes the user's virtual-credit wallet and a refresh() to keep the balance in sync.
export const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setWallet(await currencyService.getWallet());
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else setWallet(null);
  }, [isAuthenticated, refresh]);

  const value = { wallet, balance: wallet?.balance ?? 0, loading, refresh };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
