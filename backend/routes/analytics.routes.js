const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/analytics/user - Get logged in user's AI Analytics
router.get('/user', analyticsController.getUserAnalytics);

// GET /api/analytics/admin - Get Admin system-wide overview
router.get('/admin', analyticsController.getAdminOverview);

module.exports = router;
