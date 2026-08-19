const crypto = require('crypto');
const { query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');
const notificationSocket = require('./notification.socket');

function makeNotificationId() {
    return typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `notification_${crypto.randomBytes(12).toString('hex')}`;
}

function toNotification(row) {
    return {
        id: row.id,
        type: row.type,
        text: row.text,
        read: row.read,
        createdAt: row.created_at,
        link: row.link,
    };
}

async function listNotifications(userId) {
    const result = await query(
        `SELECT id, type, text, read, link, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId],
    );
    return result.rows.map(toNotification);
}

async function markNotificationRead(userId, notificationId) {
    const id = String(notificationId || '').trim();
    const result = await query(
        `UPDATE notifications
         SET read = true, read_at = COALESCE(read_at, NOW())
         WHERE id = $1 AND user_id = $2
             RETURNING id`,
        [id, userId],
    );
    if (!result.rowCount) {
        throw createHttpError(404, 'Notification not found.');
    }
    return { ok: true };
}

async function markAllNotificationsRead(userId) {
    const result = await query(
        `UPDATE notifications
         SET read = true, read_at = NOW()
         WHERE user_id = $1 AND read = false
             RETURNING id`,
        [userId],
    );
    return { ok: true, updatedCount: result.rowCount };
}

async function createNotification(userId, data = {}) {
    const text = String(data.text || '').trim();
    if (!text) {
        throw createHttpError(400, 'Notification text is required.');
    }

    const result = await query(
        `INSERT INTO notifications (id, user_id, type, text, link)
         VALUES ($1, $2, $3, $4, $5)
             RETURNING id, type, text, read, link, created_at`,
        [
            makeNotificationId(), userId,
            String(data.type || 'system').trim() || 'system',
            text, data.link ? String(data.link) : null,
        ],
    );
    const notification = toNotification(result.rows[0]);
    notificationSocket.broadcastToUser(userId, notification);
    return notification;
}

async function createAuctionNotifications(listingId, options = {}) {
    const recipientsResult = await query(
        `SELECT seller_id AS user_id
     FROM listings
     WHERE id = $1
     UNION
     SELECT bidder_id AS user_id
     FROM bids
     WHERE listing_id = $1`,
        [listingId],
    );

    const recipients = recipientsResult.rows
        .map((row) => row.user_id)
        .filter((userId) => userId !== options.excludeUserId);

    return Promise.all(recipients.map((userId) => createNotification(userId, {
        type: options.type || 'bid',
        text: options.textByUserId?.[userId] || options.text,
        link: options.link || `/marketplace/${listingId}`,
    })));
}

module.exports = {
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    createNotification,
    createAuctionNotifications,
};
