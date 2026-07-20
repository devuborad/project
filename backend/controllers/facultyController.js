const db = require('../config/db');

// ========================
// LECTURES
// ========================

exports.getLectures = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [lectures] = await db.execute(
      'SELECT * FROM lectures WHERE faculty_id = ? ORDER BY date DESC, time DESC',
      [facultyId]
    );
    res.json(lectures);
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({ error: 'Server error fetching lectures' });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { title, date, time, course, topic, meetingLink } = req.body;
    
    if (!title || !date || !time || !course) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.execute(
      'INSERT INTO lectures (faculty_id, title, date, time, course, topic, meeting_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [facultyId, title, date, time, course, topic || null, meetingLink || null]
    );

    const [newLecture] = await db.execute('SELECT * FROM lectures WHERE id = ?', [result.insertId]);
    res.status(201).json(newLecture[0]);
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({ error: 'Server error creating lecture' });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM lectures WHERE id = ? AND faculty_id = ?', [id, facultyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lecture not found or unauthorized' });
    }
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({ error: 'Server error deleting lecture' });
  }
};

// ========================
// STUDENTS (Course Roster)
// ========================

exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, sp.major 
      FROM users u 
      LEFT JOIN student_profiles sp ON u.id = sp.user_id 
      WHERE u.role = 'student' 
      ORDER BY u.first_name ASC
    `);
    res.json(students);
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [students] = await db.execute(`
      SELECT cs.id as enrollment_id, cs.course_name as course, u.id, u.first_name, u.last_name, u.email, sp.major, sp.graduation_year
      FROM course_students cs
      JOIN users u ON cs.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE cs.faculty_id = ?
      ORDER BY u.last_name ASC
    `, [facultyId]);
    
    const formatted = students.map(s => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      email: s.email,
      major: s.major || 'Undeclared',
      year: s.graduation_year ? `Class of ${s.graduation_year}` : 'N/A',
      course: s.course
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { email, course } = req.body;
    
    if (!email || !course) return res.status(400).json({ error: 'Email and course are required' });

    // Find student by email
    const [users] = await db.execute('SELECT id, role FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Student with this email not found' });
    }
    
    const student = users[0];
    if (student.role !== 'student') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // Check if already enrolled
    const [existing] = await db.execute('SELECT id FROM course_students WHERE faculty_id = ? AND course_name = ? AND student_id = ?', [facultyId, course, student.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Student already added to this course' });
    }

    await db.execute('INSERT INTO course_students (faculty_id, course_name, student_id) VALUES (?, ?, ?)', [facultyId, course, student.id]);
    
    // Fetch full data to return
    const [newStudent] = await db.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email, sp.major, sp.graduation_year
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [student.id]);
    
    const s = newStudent[0];
    res.status(201).json({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      email: s.email,
      major: s.major || 'Undeclared',
      year: s.graduation_year ? `Class of ${s.graduation_year}` : 'N/A',
      course: course
    });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Student already added' });
    res.status(500).json({ error: 'Server error adding student' });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { course, studentId } = req.params;
    const decodedCourse = decodeURIComponent(course);

    const [result] = await db.execute('DELETE FROM course_students WHERE faculty_id = ? AND course_name = ? AND student_id = ?', [facultyId, decodedCourse, studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found in this course' });
    }
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Server error removing student' });
  }
};

// ========================
// ATTENDANCE
// ========================

exports.getAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { course, date } = req.params;
    const decodedCourse = decodeURIComponent(course);

    // Get all students enrolled in this course for this faculty
    const [roster] = await db.execute(`
      SELECT cs.student_id, u.first_name, u.last_name, u.email, u.avatar_url
      FROM course_students cs
      JOIN users u ON cs.student_id = u.id
      WHERE cs.faculty_id = ? AND cs.course_name = ?
      ORDER BY u.last_name ASC
    `, [facultyId, decodedCourse]);

    // Get existing attendance records for this date
    const [attendanceRecords] = await db.execute(`
      SELECT student_id, status FROM attendance 
      WHERE faculty_id = ? AND course = ? AND date = ?
    `, [facultyId, decodedCourse, date]);

    const statusMap = {};
    attendanceRecords.forEach(record => {
      statusMap[record.student_id] = record.status;
    });

    const result = roster.map(student => ({
      id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      avatar_url: student.avatar_url,
      status: statusMap[student.student_id] || null // null means not marked yet
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Server error fetching attendance' });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { course, date, studentId, status } = req.body;

    if (!course || !date || !studentId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if record exists
    const [existing] = await db.execute(
      'SELECT id FROM attendance WHERE faculty_id = ? AND course = ? AND date = ? AND student_id = ?',
      [facultyId, course, date, studentId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE attendance SET status = ? WHERE id = ?',
        [status, existing[0].id]
      );
    } else {
      await db.execute(
        'INSERT INTO attendance (faculty_id, student_id, course, date, status) VALUES (?, ?, ?, ?, ?)',
        [facultyId, studentId, course, date, status]
      );
    }

    res.json({ message: 'Attendance updated' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Server error marking attendance' });
  }
};

// ========================
// OVERVIEW
// ========================
exports.getOverview = async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    // Total Students (unique students across all courses)
    const [[{ totalStudents }]] = await db.execute('SELECT COUNT(DISTINCT student_id) as totalStudents FROM course_students WHERE faculty_id = ?', [facultyId]);
    
    // Active Assignments (due date >= today)
    const [[{ activeAssignments }]] = await db.execute('SELECT COUNT(id) as activeAssignments FROM assignments WHERE faculty_id = ? AND due_date >= CURDATE()', [facultyId]);
    
    // Upcoming Lectures
    const [[{ upcomingLectures }]] = await db.execute('SELECT COUNT(id) as upcomingLectures FROM lectures WHERE faculty_id = ? AND date >= CURDATE()', [facultyId]);
    
    // Recent Submissions
    const [recentSubmissions] = await db.execute(`
      SELECT asub.id, asub.submitted_at, u.first_name, u.last_name, u.avatar_url, a.title
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN users u ON asub.student_id = u.id
      WHERE a.faculty_id = ?
      ORDER BY asub.submitted_at DESC
      LIMIT 3
    `, [facultyId]);
    
    // Upcoming Schedule
    const [upcomingSchedule] = await db.execute(`
      SELECT id, title, course, date, time
      FROM lectures
      WHERE faculty_id = ? AND date >= CURDATE()
      ORDER BY date ASC, time ASC
      LIMIT 3
    `, [facultyId]);

    res.json({
      totalStudents,
      activeAssignments,
      upcomingLectures,
      recentSubmissions,
      upcomingSchedule
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Server error fetching overview' });
  }
};

// ========================
// ASSIGNMENTS
// ========================
exports.getAssignments = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [assignments] = await db.execute(`
      SELECT a.*, 
        (SELECT COUNT(*) FROM assignment_submissions asub WHERE asub.assignment_id = a.id) as submitted_count,
        (SELECT COUNT(DISTINCT cs.student_id) FROM course_students cs WHERE cs.course_name = a.course AND cs.faculty_id = ?) as total_enrolled
      FROM assignments a
      WHERE a.faculty_id = ?
      ORDER BY a.due_date ASC
    `, [facultyId, facultyId]);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { title, description, due_date, course } = req.body;
    
    if (!title || !due_date || !course) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.execute(
      'INSERT INTO assignments (faculty_id, title, description, due_date, course) VALUES (?, ?, ?, ?, ?)',
      [facultyId, title, description || null, due_date, course]
    );
    
    const [newAssignment] = await db.execute('SELECT * FROM assignments WHERE id = ?', [result.insertId]);
    res.status(201).json(newAssignment[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM assignments WHERE id = ? AND faculty_id = ?', [id, facultyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
