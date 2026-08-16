import Icon from '../Icon/Icon.jsx';
import './Toast.css';

const ICONS = { success: 'check', error: 'close', info: 'bell' };

/** A single toast. Rendered by ToastProvider; not used directly by pages. */
export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className={`toast toast--${type}`} role="status">
      <span className="toast__icon">
        <Icon name={ICONS[type] || 'bell'} size={16} />
      </span>
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss notification">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
