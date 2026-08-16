import { formatTime } from '../../utils/formatDate.js';
import './ChatBubble.css';

export default function ChatBubble({ message, mine }) {
  return (
    <div className={`bubble-row ${mine ? 'bubble-row--mine' : ''}`}>
      <div className={`bubble ${mine ? 'bubble--mine' : ''}`}>
        <p className="bubble__text">{message.text}</p>
        <span className="bubble__time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
