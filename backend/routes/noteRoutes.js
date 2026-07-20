const express = require('express');
const router = express.Router();
const { getNotes, uploadNote, deleteNote } = require('../controllers/noteController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);

router.get('/', getNotes);
router.post('/upload', upload.single('file'), uploadNote);
router.delete('/:id', deleteNote);

module.exports = router;
