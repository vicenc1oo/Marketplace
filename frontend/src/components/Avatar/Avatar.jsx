import { placeholderAvatar } from '../../utils/placeholder.js';
import './Avatar.css';

// Round avatar; falls back to initials and can show an online-status dot.
export default function Avatar({ src, name = '', size = 40, online, showStatus = false, className = '' }) {
  const source = src || placeholderAvatar(name || '?', size);
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size }}>
      <img className="avatar__img" src={source} alt={name ? `${name}'s avatar` : 'Avatar'} loading="lazy" />
      {showStatus && (
        <span
          className={`avatar__status avatar__status--${online ? 'online' : 'offline'}`}
          title={online ? 'Online' : 'Offline'}
        />
      )}
    </span>
  );
}
