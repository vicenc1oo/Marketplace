import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext.jsx';

/** Access the shared socket connection (subscribe / emit / connected). */
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}
