let io = null;

function auctionRoom(listingId) {
    return `auction:${listingId}`;
}

function isValidListingId(listingId) {
    return typeof listingId === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(listingId);
}

function initialize(socketServer) {
    io = socketServer;
}

function register(socket) {
    socket.on('auction:join', (listingId) => {
        if (isValidListingId(listingId)) socket.join(auctionRoom(listingId));
    });

    socket.on('auction:leave', (listingId) => {
        if (isValidListingId(listingId)) socket.leave(auctionRoom(listingId));
    });
}

function broadcastBid(bid) {
    if (io && bid?.listingId) {
        io.to(auctionRoom(bid.listingId)).emit('bid:placed', bid);
    }
}

module.exports = {
    initialize,
    register,
    broadcastBid,
};
