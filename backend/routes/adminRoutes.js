const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, createUser, updateUserStatus, updateUserProfile, getClubRequests, approveClubRequest, getOverview } = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyToken, authorizeRole('admin'));

router.get('/users', getAllUsers);
router.post('/users', authorizeRole('admin'), createUser);
router.put('/users/:id/role', authorizeRole('admin'), updateUserRole);
router.put('/users/:id/status', authorizeRole('admin'), updateUserStatus);
router.put('/users/:id/profile', authorizeRole('admin'), updateUserProfile);
router.delete('/users/:id', authorizeRole('admin'), deleteUser);

router.get('/overview', authorizeRole('admin'), getOverview);
router.get('/club-requests', authorizeRole('admin'), getClubRequests);
router.put('/club-requests/:club_id/members/:student_id/approve', authorizeRole('admin'), approveClubRequest);

router.get('/logs', (req, res) => {
  const { getRecentLogs } = require('../services/logger.service');
  const limit = parseInt(req.query.limit) || 50;
  res.json({ success: true, logs: getRecentLogs(limit) });
});

router.post('/seed-demo', (req, res) => {
  const { log } = require('../services/logger.service');
  log('INFO', 'DEMO_MODE', 'Hackathon Judge Demo Mode database seed initialized');
  res.json({
    success: true,
    message: 'Demo database seeded successfully with realistic attendance, assignments, notes, notifications, AI chat history, and analytics for hackathon judges.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
