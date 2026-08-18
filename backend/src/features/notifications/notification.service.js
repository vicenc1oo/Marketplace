const crypto = require('crypto');
const { query } = require('../../config/db');
const { createHttpError } = require('../../utils/response.utils');

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
    return toNotification(result.rows[0]);
}

module.exports = {
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    createNotification,
};
