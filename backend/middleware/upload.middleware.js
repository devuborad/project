const multer = require('multer');

// Configure memory storage
const storage = multer.memoryStorage();

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware wrapper to handle multer errors gracefully
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., file too large)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      // An unknown error occurred, or our fileFilter error
      return res.status(400).json({ success: false, error: err.message });
    }
    
    // Everything went fine
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume PDF file.' });
    }
    
    next();
  });
};

module.exports = { uploadMiddleware };
