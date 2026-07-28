const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/notifications - Get recent notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread count badge
router.get('/unread-count', notificationController.getUnreadCount);

// POST /api/notifications/mark-read - Mark one or all notifications as read
router.post('/mark-read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
