const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, getMyProfile, updateStudentProfile, getOverview, getResume, uploadResume } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getStudents);
router.get('/overview', getOverview);
router.get('/me', getMyProfile);
router.get('/resume', getResume);
router.post('/resume', require('../middleware/upload').single('file'), uploadResume);
router.get('/:id', getStudentProfile);
router.put('/profile', updateStudentProfile);

module.exports = router;
