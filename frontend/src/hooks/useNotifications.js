import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/notification.service.js';
import { useSocket } from './useSocket.js';

// Loads notifications and prepends any pushed live over the socket.
export function useNotifications() {
  const { subscribe } = useSocket();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    service
      .getNotifications()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return subscribe('notification', (n) => setItems((list) => [n, ...list]));
  }, [subscribe]);

  const markRead = useCallback(async (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await service.markNotificationRead(id);
    } catch {
      /* optimistic — ignore failure in mock mode */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    try {
      await service.markAllNotificationsRead();
    } catch {
      /* optimistic */
    }
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;
  return { items, unreadCount, loading, markRead, markAllRead, reload: load };
}
