// Chat (HTTP side; live delivery via socket). Conversations and messages.
// Backend: GET /chat/conversations(/:id), POST /chat/conversations/:id/messages.
import { apiGet, apiPost, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getConversations = () =>
  USE_MOCKS ? mock.getConversations() : apiGet('/chat/conversations');

export const getConversation = (id) =>
  USE_MOCKS ? mock.getConversation(id) : apiGet(`/chat/conversations/${id}`);

export const sendMessage = (conversationId, text) =>
  USE_MOCKS
    ? mock.sendMessage(conversationId, text)
    : apiPost(`/chat/conversations/${conversationId}/messages`, { text });
