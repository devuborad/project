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

module.exports = {
  getStudents,
  getStudentProfile,
  getMyProfile,
  updateStudentProfile
};
