const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmap.controller');
const { verifyToken } = require('../middleware/auth');

// Protected route to generate roadmap
router.post('/generate', verifyToken, roadmapController.generateRoadmap);

module.exports = router;
