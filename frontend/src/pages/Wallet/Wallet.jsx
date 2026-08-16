import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon.jsx';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { useCurrency } from '../../hooks/useCurrency.js';
import { formatCredits } from '../../utils/formatPrice.js';
import { formatDate } from '../../utils/formatDate.js';
import './Wallet.css';

// Virtual-credit wallet: current balance and a ledger of transactions.
export default function Wallet() {
  const { wallet, balance, loading, refresh } = useCurrency();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="container page wallet">
      <header className="page__header">
        <h1 className="page__title">Wallet</h1>
        <p className="page__subtitle">Credits are used to promote your listings.</p>
      </header>

      <div className="wallet__balance">
        <div>
          <span className="wallet__balance-label">Available balance</span>
          <div className="wallet__balance-value">
            <Icon name="wallet" size={24} /> {formatCredits(balance)}
          </div>
        </div>
        <Button as={Link} to="/promotions" variant="accent">
          <Icon name="rocket" size={16} /> Promote a listing
        </Button>
      </div>

      <section className="wallet__history">
        <h2 className="wallet__history-title">Transaction history</h2>
        {loading && !wallet ? (
          <div className="wallet__center"><Spinner /></div>
        ) : !wallet?.transactions?.length ? (
          <EmptyState icon="wallet" title="No transactions yet" description="Your credit activity will appear here." />
        ) : (
          <ul className="wallet__list">
            {wallet.transactions.map((t) => (
              <li key={t.id} className="wallet__row">
                <span className={`wallet__icon wallet__icon--${t.type}`}>
                  <Icon name={t.type === 'credit' ? 'plus' : 'rocket'} size={16} />
                </span>
                <div className="wallet__row-info">
                  <span className="wallet__row-desc">{t.description}</span>
                  <span className="wallet__row-date">{formatDate(t.createdAt)}</span>
                </div>
                <span className={`wallet__amount wallet__amount--${t.type}`}>
                  {t.type === 'credit' ? '+' : '−'}{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
