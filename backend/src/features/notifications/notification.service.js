const crypto = require('crypto');
const { createHttpError } = require('../../utils/response.utils');

const DEFAULT_USER_ID = 'u1';

function daysAgo(days) {
    return new Date(Date.now() - days * 86400000).toISOString();
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const notificationsByUser = new Map([
    [
        DEFAULT_USER_ID,
        [
            {
                id: 'n1',
                type: 'bid',
                text: 'You were outbid on “Espresso machine”.',
                read: false,
                createdAt: daysAgo(0.05),
                link: '/marketplace/l8',
            },
            {
                id: 'n2',
                type: 'message',
                text: 'New message from Marta Silva.',
                read: false,
                createdAt: daysAgo(0.2),
                link: '/chat/c1',
            },
            {
                id: 'n3',
                type: 'favorite',
                text: 'Someone saved your “4K monitor”.',
                read: true,
                createdAt: daysAgo(1),
                link: '/marketplace/l11',
            },
            {
                id: 'n4',
                type: 'system',
                text: 'Your listing “Bookshelf” was marked as sold.',
                read: true,
                createdAt: daysAgo(2),
                link: '/dashboard',
            },
        ],
    ],
]);

function getUserNotifications(userId) {
    if (!notificationsByUser.has(userId)) {
        notificationsByUser.set(userId, []);
    }

    return notificationsByUser.get(userId);
}

function makeNotificationId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `n_${crypto.randomBytes(12).toString('hex')}`;
}

async function listNotifications(userId) {
    return clone(
        [...getUserNotifications(userId)].sort(
            (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
        ),
    );
}

async function markNotificationRead(userId, notificationId) {
    const id = String(notificationId || '').trim();
    const notification = getUserNotifications(userId).find((item) => item.id === id);

    if (!notification) {
        throw createHttpError(404, 'Notification not found.');
    }

    notification.read = true;
    return { ok: true };
}

async function markAllNotificationsRead(userId) {
    let updatedCount = 0;

    getUserNotifications(userId).forEach((notification) => {
        if (!notification.read) {
            notification.read = true;
            updatedCount += 1;
        }
    });

    return { ok: true, updatedCount };
}

async function createNotification(userId, data = {}) {
    const text = String(data.text || '').trim();
    if (!text) {
        throw createHttpError(400, 'Notification text is required.');
    }

    const notification = {
        id: makeNotificationId(),
        type: String(data.type || 'system').trim() || 'system',
        text,
        read: false,
        createdAt: new Date().toISOString(),
        link: data.link ? String(data.link) : null,
    };

    getUserNotifications(userId).unshift(notification);
    return clone(notification);
}

module.exports = {
    DEFAULT_USER_ID,
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    createNotification,
};
