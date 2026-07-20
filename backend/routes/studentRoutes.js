const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, getMyProfile, updateStudentProfile } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getStudents);
router.get('/me', getMyProfile);
router.get('/:id', getStudentProfile);
router.put('/profile', updateStudentProfile);

module.exports = router;
