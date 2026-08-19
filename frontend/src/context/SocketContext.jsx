import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken, USE_MOCKS } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

// Owns the single socket.io connection for chat, bidding and notifications.
// In mock mode it stays disconnected but still exposes subscribe()/emit().
export const SocketContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (USE_MOCKS) return; // No live server in mock mode.
    const token = getToken();
    if (!token || !user) return;

    const socket = io(WS_URL, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id]);

  // Subscribe to an event; returns an unsubscribe function (no-op in mock mode).
  const subscribe = (event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  };

  const emit = (event, payload) => {
    socketRef.current?.emit(event, payload);
  };

  const value = { connected, subscribe, emit, isMock: USE_MOCKS };
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
