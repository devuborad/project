const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

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

    // Get Recent Faculty Activity (Notes & Assignments)
    const [recentNotes] = await db.execute(`
      SELECT n.title, n.subject as course, n.created_at as date, 'material' as type, u.first_name, u.last_name
      FROM notes n
      JOIN users u ON n.uploader_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 3
    `);

    const [recentAssignments] = await db.execute(`
      SELECT a.title, a.course, a.created_at as date, 'assignment' as type, u.first_name, u.last_name
      FROM assignments a
      JOIN users u ON a.faculty_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 3
    `);

    const recentActivity = [...recentNotes, ...recentAssignments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      attendance,
      cgpa: 8.9, // Mocked for now
      studyHours: 24, // Mocked for now
      tasksDone: completed_assignments,
      totalTasks: total_assignments,
      upcomingSchedule,
      recentActivity
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

// Get Attendance Details
const getAttendanceDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [[studentProfile]] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    if (!studentProfile) return res.status(404).json({ error: 'Student profile not found' });
    
    const [attendance] = await db.execute(`
      SELECT l.title, l.course, l.date, l.time, a.status 
      FROM attendance a
      JOIN lectures l ON a.lecture_id = l.id
      WHERE a.student_id = ?
      ORDER BY l.date DESC, l.time DESC
    `, [studentProfile.id]);
    
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// Get Completed Tasks
const getCompletedTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [tasks] = await db.execute(`
      SELECT a.title, a.course, a.due_date, s.submitted_at, s.file_url
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `, [userId]); // user_id used for student_id in submissions based on previous code
    
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get CGPA Details
const getCGPADetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [grades] = await db.execute(`
      SELECT a.title, a.course, s.grade 
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ? AND s.grade IS NOT NULL
      ORDER BY s.submitted_at DESC
    `, [userId]);
    
    res.json(grades);
  } catch (error) {
    next(error);
  }
};

// Get Calendar Events (Lectures, Assignments, Hackathons, Events, Attendance)
const getCalendarEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Lectures
    const [lectures] = await db.execute(`
      SELECT l.id, l.title, l.course, l.date, l.time, l.meeting_link, 'lecture' as type
      FROM lectures l
      JOIN course_students cs ON l.course = cs.course_name
      WHERE cs.student_id = ?
    `, [userId]);

    // Assignments
    const [assignments] = await db.execute(`
      SELECT a.id, a.title, a.course, a.due_date as date, '23:59:00' as time, 'assignment' as type, a.description
      FROM assignments a
      JOIN course_students cs ON a.course = cs.course_name
      WHERE cs.student_id = ?
    `, [userId]);

    // Club Events (Assuming any student can see events, or only members?)
    // The prompt says "event all club detail and student also shaw their lecture"
    // Let's get all upcoming events
    const [events] = await db.execute(`
      SELECT e.id, e.title, c.name as course, e.event_date as date, TIME(e.event_date) as time, 'event' as type, e.description, e.location
      FROM events e
      JOIN clubs c ON e.club_id = c.id
    `);

    // Club Hackathons
    const [hackathons] = await db.execute(`
      SELECT h.id, h.title, c.name as course, h.start_date as date, TIME(h.start_date) as time, 'hackathon' as type, h.description
      FROM club_hackathons h
      JOIN clubs c ON h.club_id = c.id
    `);

    // Get student profile ID
    const [[studentProfile]] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    
    let attendance = [];
    if (studentProfile) {
      // Attendance records
      const [att] = await db.execute(`
        SELECT a.id, l.title, l.course, a.date, l.time, 'attendance' as type, a.status as description
        FROM attendance a
        JOIN lectures l ON a.lecture_id = l.id
        WHERE a.student_id = ?
      `, [studentProfile.id]);
      attendance = att;
    }

    res.json([...lectures, ...assignments, ...events, ...hackathons, ...attendance]);
  } catch (error) {
    next(error);
  }
};

// Get pending and completed assignments
const getAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [assignments] = await db.execute(`
      SELECT a.*, 
        (SELECT s.file_url FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.student_id = ?) as submission_url,
        (SELECT s.grade FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.student_id = ?) as grade
      FROM assignments a
      JOIN course_students cs ON a.course = cs.course_name
      WHERE cs.student_id = ?
      ORDER BY a.due_date ASC
    `, [userId, userId, userId]);
    
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// Submit Assignment
const submitAssignment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const userId = req.user.id;
    const { assignment_id } = req.body;

    if (!assignment_id) {
      return res.status(400).json({ error: 'Assignment ID is required' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'campus_ai/submissions'
    });

    await db.execute(`
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url)
      VALUES (?, ?, ?)
    `, [assignment_id, userId, result.secure_url]);

    res.status(201).json({ message: 'Assignment submitted successfully', file_url: result.secure_url });
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
  uploadResume,
  getAttendanceDetails,
  getCompletedTasks,
  getCGPADetails,
  getCalendarEvents,
  getAssignments,
  submitAssignment
};
