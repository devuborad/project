const express = require('express');
const router = express.Router();
const { getInternships, createInternship, applyForInternship } = require('../controllers/internshipController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getInternships);
router.post('/', authorizeRole('faculty', 'admin'), createInternship);
router.post('/apply', authorizeRole('student'), applyForInternship);

module.exports = router;
