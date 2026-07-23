const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { verifyToken } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload.middleware');

// Protected route to upload and analyze a resume
router.post('/analyze', verifyToken, uploadMiddleware, resumeController.analyzeResume);

module.exports = router;
