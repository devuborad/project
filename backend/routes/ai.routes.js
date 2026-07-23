const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middleware/auth');
const { chatUploadMiddleware } = require('../middleware/chatUpload.middleware');

// Apply authentication middleware to protect all AI routes
router.use(verifyToken);

// POST /api/ai/chat
// Route specifically for the Campus AI Copilot feature
router.post('/chat', chatUploadMiddleware, aiController.chat);

// GET /api/ai/models
// Temporary debug endpoint to list available Gemini models
router.get('/models', aiController.listModels);

module.exports = router;
