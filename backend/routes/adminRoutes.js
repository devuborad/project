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

module.exports = router;
