import { NavLink } from 'react-router-dom';
import Avatar from '../Avatar/Avatar.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import { timeAgo } from '../../utils/formatDate.js';
import './ConversationList.css';

// Chat left rail: one NavLink row per conversation with preview and unread count.
export default function ConversationList({ conversations = [] }) {
  if (!conversations.length) {
    return (
      <EmptyState
        icon="message"
        title="No conversations yet"
        description="When you message a seller or someone messages you, it'll show up here."
      />
    );
  }

  return (
    <ul className="conv-list">
      {conversations.map((c) => (
        <li key={c.id}>
          <NavLink
            to={`/chat/${c.id}`}
            className={({ isActive }) => `conv ${isActive ? 'conv--active' : ''}`}
          >
            <Avatar src={c.other?.avatarUrl} name={c.other?.name} size={44} showStatus online={c.other?.online} />
            <div className="conv__main">
              <div className="conv__top">
                <span className="conv__name">{c.other?.name}</span>
                {c.lastMessage && (
                  <span className="conv__time">{timeAgo(c.lastMessage.createdAt)}</span>
                )}
              </div>
              {c.listing && <span className="conv__listing">{c.listing.title}</span>}
              <p className="conv__preview">{c.lastMessage?.text || 'No messages yet'}</p>
            </div>
            {c.unread > 0 && <span className="conv__unread" aria-label={`${c.unread} unread`}>{c.unread}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
