const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, createUser, updateUserStatus } = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyToken, authorizeRole('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
