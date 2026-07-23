const express = require('express');
const router = express.Router();
const { getNotes, uploadNote, deleteNote } = require('../controllers/noteController');
const { summarizeNotes } = require('../controllers/notesAI.controller');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadNotesMiddleware } = require('../middleware/uploadNotes.middleware');

router.use(verifyToken);

router.get('/', getNotes);
router.post('/upload', upload.single('file'), uploadNote);
router.delete('/:id', deleteNote);

// New AI Summarization Route
router.post('/summarize', uploadNotesMiddleware, summarizeNotes);

module.exports = router;
