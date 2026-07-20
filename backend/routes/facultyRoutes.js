const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(authorizeRole('faculty'));

// Lectures
router.get('/lectures', facultyController.getLectures);
router.post('/lectures', facultyController.createLecture);
router.delete('/lectures/:id', facultyController.deleteLecture);

// Students
router.get('/all-students', facultyController.getAllStudents);
router.get('/students', facultyController.getStudents);
router.post('/students', facultyController.addStudent);
router.delete('/students/:course/:studentId', facultyController.removeStudent);

// Attendance
router.get('/attendance/:course/:date', facultyController.getAttendance);
router.post('/attendance', facultyController.markAttendance);

// Overview
router.get('/overview', facultyController.getOverview);

// Assignments
router.get('/assignments', facultyController.getAssignments);
router.post('/assignments', facultyController.createAssignment);
router.delete('/assignments/:id', facultyController.deleteAssignment);

module.exports = router;
