const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, uploadAvatar } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

module.exports = router;
