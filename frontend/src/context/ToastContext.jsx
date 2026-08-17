import { createContext, useCallback, useState } from 'react';
import Toast from '../components/Toast/Toast.jsx';

// App-wide toast notifications for transient feedback via the useToast hook.
export const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counter;
    setToasts((list) => [...list, { id, message, type }]);
    if (duration) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const value = {
    show: push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
