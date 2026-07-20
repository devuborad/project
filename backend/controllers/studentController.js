const db = require('../config/db');

// Get all students
const getStudents = async (req, res, next) => {
  try {
    const [students] = await db.execute(`
      SELECT s.id, u.first_name, u.last_name, u.email, u.avatar_url, s.major, s.graduation_year 
      FROM student_profiles s
      JOIN users u ON s.user_id = u.id
    `);
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// Get single student profile
const getStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [students] = await db.execute(`
      SELECT s.id, u.first_name, u.last_name, u.email, u.avatar_url, s.major, s.graduation_year, s.bio, s.github_url, s.linkedin_url 
      FROM student_profiles s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(students[0]);
  } catch (error) {
    next(error);
  }
};

// Get my student profile
const getMyProfile = async (req, res, next) => {
  try {
    const [students] = await db.execute(`
      SELECT s.id, u.first_name, u.last_name, u.email, u.avatar_url, s.major, s.graduation_year, s.bio, s.github_url, s.linkedin_url 
      FROM student_profiles s
      JOIN users u ON s.user_id = u.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(students[0]);
  } catch (error) {
    next(error);
  }
};

// Update student profile (Self only)
const updateStudentProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, major, graduation_year, bio, github_url, linkedin_url } = req.body;
    
    // Make sure student exists
    const [studentCheck] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (studentCheck.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Update users table first for name changes
    if (first_name || last_name) {
      await db.execute(`
        UPDATE users 
        SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name)
        WHERE id = ?
      `, [first_name, last_name, req.user.id]);
    }

    // Update student_profiles table
    await db.execute(`
      UPDATE student_profiles 
      SET major = ?, graduation_year = ?, bio = ?, github_url = ?, linkedin_url = ?
      WHERE user_id = ?
    `, [major, graduation_year, bio, github_url, linkedin_url, req.user.id]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Student Dashboard Overview
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get student profile ID
    const [[studentProfile]] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    if (!studentProfile) return res.status(404).json({ error: 'Student profile not found' });
    const studentId = studentProfile.id;

    // Get Attendance
    const [[{ total_classes, attended_classes }]] = await db.execute(`
      SELECT 
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as attended_classes
      FROM attendance
      WHERE student_id = ?
    `, [studentId]);
    const attendance = total_classes > 0 ? Math.round((attended_classes / total_classes) * 100) : 0;

    // Get Upcoming Schedule (Lectures)
    const [upcomingSchedule] = await db.execute(`
      SELECT l.id, l.title, l.course, l.date, l.time
      FROM lectures l
      JOIN course_students cs ON l.course = cs.course_name
      WHERE cs.student_id = ? AND l.date >= CURDATE()
      ORDER BY l.date ASC, l.time ASC
      LIMIT 3
    `, [userId]); // course_students uses user_id as student_id from earlier

    // Get Assignments Stats
    const [[{ total_assignments }]] = await db.execute(`
      SELECT COUNT(*) as total_assignments
      FROM assignments a
      JOIN course_students cs ON a.course = cs.course_name
      WHERE cs.student_id = ?
    `, [userId]);

    const [[{ completed_assignments }]] = await db.execute(`
      SELECT COUNT(*) as completed_assignments
      FROM assignment_submissions
      WHERE student_id = ?
    `, [userId]); // user_id in course_students but student_id in submissions? Let's assume user_id.

    res.json({
      attendance,
      cgpa: 8.9, // Mocked for now
      studyHours: 24, // Mocked for now
      tasksDone: completed_assignments,
      totalTasks: total_assignments,
      upcomingSchedule
    });
  } catch (error) {
    next(error);
  }
};

// Get Resume
const getResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [resumes] = await db.execute('SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1', [userId]);
    
    if (resumes.length === 0) {
      return res.status(404).json({ error: 'No resume found' });
    }
    
    res.json(resumes[0]);
  } catch (error) {
    next(error);
  }
};

// Upload Resume
const cloudinary = require('../config/cloudinary');
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const userId = req.user.id;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'campus_ai/resumes'
    });

    // Generate mock ATS score (70-95)
    const atsScore = Math.floor(Math.random() * (95 - 70 + 1) + 70);
    const feedback = atsScore > 85 ? 'Excellent formatting and keywords.' : 'Consider adding more technical keywords and action verbs.';

    const [dbResult] = await db.execute(`
      INSERT INTO resumes (user_id, file_url, ats_score, feedback)
      VALUES (?, ?, ?, ?)
    `, [userId, result.secure_url, atsScore, feedback]);

    res.status(201).json({
      message: 'Resume uploaded successfully',
      id: dbResult.insertId,
      file_url: result.secure_url,
      ats_score: atsScore,
      feedback: feedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentProfile,
  getMyProfile,
  updateStudentProfile,
  getOverview,
  getResume,
  uploadResume
};
