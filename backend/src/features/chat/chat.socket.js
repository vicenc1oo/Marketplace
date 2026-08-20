const { query } = require('../../config/db');

let io = null;

function initialize(socketServer) {
    io = socketServer;
}

function broadcastMessage(recipientId, message) {
    if (io && recipientId && message) {
        io.to(`user:${recipientId}`).emit('message', message);
    }
}

function broadcastConversation(recipientId, conversation) {
    if (io && recipientId && conversation) {
        io.to(`user:${recipientId}`).emit('conversation:updated', conversation);
    }
}

async function findOtherParticipant(userId, conversationId) {
    const result = await query(
        `SELECT other.user_id
     FROM conversation_participants mine
     JOIN conversation_participants other
       ON other.conversation_id = mine.conversation_id
      AND other.user_id <> mine.user_id
     WHERE mine.conversation_id = $1 AND mine.user_id = $2
     LIMIT 1`,
        [conversationId, userId],
    );
    return result.rows[0]?.user_id || null;
}

function register(socket) {
    socket.on('typing', async (payload = {}) => {
        const conversationId = String(payload.conversationId || '').trim();
        if (!conversationId) return;

        try {
            const recipientId = await findOtherParticipant(socket.user.id, conversationId);
            if (recipientId) {
                io.to(`user:${recipientId}`).emit('typing', {
                    conversationId,
                    userId: socket.user.id,
                    typing: Boolean(payload.typing),
                });
            }
        } catch {
            // Typing indicators are temporary and should never interrupt the socket.
        }
    });

    socket.on('message:read', async (conversationId) => {
        try {
            const id = String(conversationId || '').trim();
            const recipientId = await findOtherParticipant(socket.user.id, id);
            if (recipientId) {
                await query(
                    `UPDATE messages SET read = true
           WHERE conversation_id = $1 AND sender_id <> $2 AND read = false`,
                    [id, socket.user.id],
                );
            }
        } catch {
            // Read state can be synchronized again when the conversation is opened.
        }
    });
}

module.exports = {
    initialize,
    register,
    broadcastMessage,
    broadcastConversation,
};
