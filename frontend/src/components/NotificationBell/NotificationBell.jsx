import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { timeAgo } from '../../utils/formatDate.js';
import './NotificationBell.css';

// Bell + dropdown of recent notifications with an unread badge.
export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="notif" ref={ref}>
      <button
        type="button"
        className="notif__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
      >
        <Icon name="bell" />
        {unreadCount > 0 && <span className="notif__dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif__panel" role="menu">
          <div className="notif__head">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className="notif__mark" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="notif__empty">You're all caught up.</p>
          ) : (
            <ul className="notif__list">
              {items.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link || '#'}
                    className={`notif__item ${n.read ? '' : 'is-unread'}`}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    role="menuitem"
                  >
                    <span className="notif__text">{n.text}</span>
                    <span className="notif__time">{timeAgo(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
