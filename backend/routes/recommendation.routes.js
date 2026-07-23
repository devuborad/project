const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/generate', recommendationController.generateRecommendations);
router.get('/latest', recommendationController.getLatestRecommendations);

module.exports = router;
