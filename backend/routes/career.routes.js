const express = require('express');
const router = express.Router();
const careerController = require('../controllers/career.controller');
const { verifyToken } = require('../middleware/auth');
const { chatUploadMiddleware } = require('../middleware/chatUpload.middleware');

router.use(verifyToken);

// Protected routes
router.post('/chat', chatUploadMiddleware, careerController.chat);
router.get('/history', careerController.getHistory);

module.exports = router;
