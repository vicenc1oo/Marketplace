let io = null;

function initialize(socketServer) {
    io = socketServer;
}

function broadcastToUser(userId, notification) {
    if (io && userId && notification) {
        io.to(`user:${userId}`).emit('notification', notification);
    }
}

module.exports = {
    initialize,
    broadcastToUser,
};
