const DEFAULT_USER_ID = 'u1';

const analyticsStore = {
    listings: [
        { id: 'l11', sellerId: 'u1', status: 'active', viewsCount: 190 },
        { id: 'l12', sellerId: 'u1', status: 'active', viewsCount: 175 },
        { id: 'l13', sellerId: 'u1', status: 'sold', viewsCount: 120 },
        { id: 'l1', sellerId: 'u2', status: 'active', viewsCount: 210 },
        { id: 'l2', sellerId: 'u3', status: 'active', viewsCount: 540 },
    ],
    bids: [
        { id: 'b1', listingId: 'l4', bidderId: 'u1' },
        { id: 'b2', listingId: 'l4', bidderId: 'u2' },
        { id: 'b3', listingId: 'l4', bidderId: 'u1' },
        { id: 'b4', listingId: 'l8', bidderId: 'u1' },
        { id: 'b5', listingId: 'l8', bidderId: 'u2' },
    ],
    conversations: [
        {
            id: 'c1',
            participantIds: ['u1', 'u2'],
            messages: [
                { id: 'm1', senderId: 'u1', read: true },
                { id: 'm2', senderId: 'u2', read: true },
                { id: 'm3', senderId: 'u1', read: false },
            ],
        },
        {
            id: 'c2',
            participantIds: ['u1', 'u3'],
            messages: [
                { id: 'm4', senderId: 'u3', read: true },
                { id: 'm5', senderId: 'u1', read: true },
                { id: 'm6', senderId: 'u3', read: true },
            ],
        },
    ],
    savedListingIdsByUser: new Map([
        [DEFAULT_USER_ID, new Set()],
    ]),
};

function countUnreadMessages(conversations, userId) {
    return conversations.reduce((total, conversation) => {
        if (!conversation.participantIds.includes(userId)) return total;

        const unreadInConversation = conversation.messages.filter(
            (message) => message.senderId !== userId && !message.read,
        ).length;

        return total + unreadInConversation;
    }, 0);
}

function sumViews(listings) {
    return listings.reduce((total, listing) => total + Number(listing.viewsCount || 0), 0);
}

async function getDashboardStats(userId = DEFAULT_USER_ID) {
    const userListings = analyticsStore.listings.filter((listing) => listing.sellerId === userId);
    const savedListingIds = analyticsStore.savedListingIdsByUser.get(userId) || new Set();

    return {
        activeListings: userListings.filter((listing) => listing.status === 'active').length,
        soldItems: userListings.filter((listing) => listing.status === 'sold').length,
        activeBids: analyticsStore.bids.filter((bid) => bid.bidderId === userId).length,
        unreadMessages: countUnreadMessages(analyticsStore.conversations, userId),
        savedListings: savedListingIds.size,
        totalViews: sumViews(userListings),
    };
}

module.exports = {
    DEFAULT_USER_ID,
    getDashboardStats,
};
