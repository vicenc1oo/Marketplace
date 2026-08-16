import Icon from '../Icon/Icon.jsx';
import './EmptyState.css';

// Friendly empty/zero-data state with an optional action.
export default function EmptyState({ icon = 'tag', title, description, action, className = '' }) {
  return (
    <div className={`empty ${className}`} role="status">
      <span className="empty__icon">
        <Icon name={icon} size={28} />
      </span>
      <h3 className="empty__title">{title}</h3>
      {description && <p className="empty__desc">{description}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
