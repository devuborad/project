const express = require('express');
const router = express.Router();
const { chat, summarizeNotes, reviewResume } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // Protect all AI routes

router.post('/chat', chat);
router.post('/summarize-notes', summarizeNotes);
router.post('/resume-review', reviewResume);

module.exports = router;
