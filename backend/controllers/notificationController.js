/**
 * Notification Center Controller (Part 6)
 * Handles retrieving user notifications, unread badge count, marking as read, and deleting.
 */

const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      notifications: rows
    });
  } catch (error) {
    console.error('[NotificationController] getNotifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      unreadCount: rows[0]?.count || 0
    });
  } catch (error) {
    console.error('[NotificationController] getUnreadCount error:', error);
    return res.status(500).json({ error: 'Failed to count unread notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id, all } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (all) {
      await db.execute(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
        [userId]
      );
    } else if (id) {
      await db.execute(
        `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
    }

    return res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('[NotificationController] markAsRead error:', error);
    return res.status(500).json({ error: 'Failed to update notification status' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await db.execute(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('[NotificationController] deleteNotification error:', error);
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
};
