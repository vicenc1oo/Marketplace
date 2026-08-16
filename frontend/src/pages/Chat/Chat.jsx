import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConversationList from '../../components/ConversationList/ConversationList.jsx';
import ChatBubble from '../../components/ChatBubble/ChatBubble.jsx';
import Avatar from '../../components/Avatar/Avatar.jsx';
import Icon from '../../components/Icon/Icon.jsx';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocket } from '../../hooks/useSocket.js';
import { useIsMobile } from '../../hooks/useMediaQuery.js';
import * as chatService from '../../services/chat.service.js';
import { formatPrice } from '../../utils/formatPrice.js';
import './Chat.css';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { subscribe } = useSocket();
  const isMobile = useIsMobile();

  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    chatService.getConversations().then(setConversations).catch(() => {}).finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setActive(null);
      return undefined;
    }
    let alive = true;
    setThreadLoading(true);
    chatService
      .getConversation(conversationId)
      .then((c) => alive && setActive(c))
      .catch(() => alive && setActive(null))
      .finally(() => alive && setThreadLoading(false));
    return () => {
      alive = false;
    };
  }, [conversationId]);

  // Live updates: append incoming messages / reflect typing (no-op in mock mode).
  useEffect(() => {
    if (!conversationId) return undefined;
    const offMsg = subscribe('message', (msg) => {
      if (msg.conversationId === conversationId) {
        setActive((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
      }
    });
    const offTyping = subscribe('typing', (payload) => {
      if (payload.conversationId === conversationId) setTyping(payload.typing);
    });
    return () => {
      offMsg();
      offTyping();
    };
  }, [conversationId, subscribe]);

  // Scroll the message list (not the page) to the bottom on new messages / open.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.id, active?.messages?.length, typing]);

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    setSending(true);
    setDraft('');
    try {
      const message = await chatService.sendMessage(active.id, text);
      setActive((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    } catch {
      setDraft(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const showList = !isMobile || !conversationId;
  const showThread = !isMobile || !!conversationId;

  return (
    <div className="container page chat">
      <div className="chat__shell">
        {showList && (
          <div className="chat__list">
            <h1 className="chat__list-title">Messages</h1>
            {listLoading ? (
              <div className="chat__center"><Spinner /></div>
            ) : (
              <ConversationList conversations={conversations} />
            )}
          </div>
        )}

        {showThread && (
          <div className="chat__thread">
            {!conversationId ? (
              <EmptyState
                icon="message"
                title="Select a conversation"
                description="Choose a conversation on the left to read and reply."
              />
            ) : threadLoading ? (
              <div className="chat__center"><Spinner /></div>
            ) : !active ? (
              <EmptyState icon="message" title="Conversation not found" />
            ) : (
              <>
                <header className="chat__header">
                  {isMobile && (
                    <Button as={Link} to="/chat" variant="ghost" size="sm" aria-label="Back to conversations">
                      <Icon name="chevron-left" />
                    </Button>
                  )}
                  <Avatar src={active.other?.avatarUrl} name={active.other?.name} size={40} showStatus online={active.other?.online} />
                  <div className="chat__header-info">
                    <span className="chat__header-name">{active.other?.name}</span>
                    <span className="chat__header-status">{active.other?.online ? 'Online' : 'Offline'}</span>
                  </div>
                </header>

                {active.listing && (
                  <Link to={`/marketplace/${active.listing.id}`} className="chat__context">
                    <img src={active.listing.images?.[0]} alt="" className="chat__context-img" />
                    <div className="chat__context-info">
                      <span className="chat__context-title">{active.listing.title}</span>
                      <span className="chat__context-price">
                        {formatPrice(active.listing.currentBid ?? active.listing.price, active.listing.currency)}
                      </span>
                    </div>
                    <Icon name="chevron-right" size={18} />
                  </Link>
                )}

                <div className="chat__messages" ref={messagesRef}>
                  {active.messages.map((m) => (
                    <ChatBubble key={m.id} message={m} mine={m.senderId === user?.id} />
                  ))}
                  {typing && (
                    <div className="chat__typing" aria-live="polite">
                      <span /><span /><span />
                    </div>
                  )}
                </div>

                <form className="chat__compose" onSubmit={send}>
                  <input
                    className="chat__input"
                    placeholder="Write a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-label="Message"
                  />
                  <Button type="submit" loading={sending} disabled={!draft.trim()} aria-label="Send message">
                    <Icon name="send" size={18} />
                  </Button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
