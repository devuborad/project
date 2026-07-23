const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, getMyProfile, updateStudentProfile, getOverview, getResume, uploadResume, getAttendanceDetails, getCompletedTasks, getCGPADetails, getCalendarEvents, getAssignments, submitAssignment } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);

router.get('/', getStudents);
router.get('/overview', getOverview);
router.get('/attendance-details', getAttendanceDetails);
router.get('/completed-tasks', getCompletedTasks);
router.get('/grades', getCGPADetails);
router.get('/calendar', getCalendarEvents);
router.get('/assignments', getAssignments);
router.post('/assignments/submit', upload.single('file'), submitAssignment);
router.get('/me', getMyProfile);
router.get('/resume', getResume);
router.post('/resume', upload.single('file'), uploadResume);
router.get('/:id', getStudentProfile);
router.put('/profile', updateStudentProfile);

module.exports = router;
