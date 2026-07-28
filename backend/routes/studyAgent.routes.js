const express = require('express');
const router = express.Router();
const multer = require('multer');
const studyAgentController = require('../controllers/studyAgent.controller');
const { verifyToken } = require('../middleware/auth');

// Configure multer for PDF only, up to 20 MB limit
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB limit
  },
  fileFilter: fileFilter
});

// Middleware to handle multer file size/format errors gracefully
const handleUploadError = (req, res, next) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          error: 'The uploaded PDF exceeds the 20 MB maximum size limit.' 
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// Protect all Study Agent routes with JWT authentication
router.use(verifyToken);

// PDF Upload Endpoint (POST /api/study-agent/upload)
router.post('/upload', handleUploadError, studyAgentController.uploadPDF);

// Study Q&A Endpoint (POST /api/study-agent/question)
router.post('/question', studyAgentController.askQuestion);

// Get student's past study notes (GET /api/study-agent/notes)
router.get('/notes', studyAgentController.getNotes);

// Get specific study note by ID (GET /api/study-agent/notes/:id)
router.get('/notes/:id', studyAgentController.getNoteById);

// Get Study Q&A history (GET /api/study-agent/history)
router.get('/history', studyAgentController.getHistory);

module.exports = router;
