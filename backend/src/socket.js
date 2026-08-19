const { Server } = require('socket.io');
const { socketOptions } = require('./config/socket');
const authService = require('./features/auth/auth.service');
const biddingSocket = require('./features/bidding/bidding.socket');
const notificationSocket = require('./features/notifications/notification.socket');
const chatSocket = require('./features/chat/chat.socket');
const { verifyToken } = require('./utils/jwt.utils');

let io = null;

function initializeSocketServer(httpServer) {
    io = new Server(httpServer, socketOptions);

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            const payload = verifyToken(token);
            const user = await authService.findUserById(payload.sub);
            if (!user) return next(new Error('Authentication user was not found.'));
            socket.user = user;
            return next();
        } catch (error) {
            return next(new Error('Invalid authentication token.'));
        }
    });

    biddingSocket.initialize(io);
    notificationSocket.initialize(io);
    chatSocket.initialize(io);
    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);
        biddingSocket.register(socket);
        chatSocket.register(socket);
    });

    return io;
}

module.exports = { initializeSocketServer };