const db = require('../config/db');

// Get all internships
const getInternships = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = `
      SELECT i.*, u.first_name, u.last_name, u.email 
      FROM internships i
      JOIN users u ON i.posted_by = u.id
    `;
    const params = [];

    if (type) {
      query += ' WHERE i.type = ?';
      params.push(type);
    }
    query += ' ORDER BY i.created_at DESC';

    const [internships] = await db.execute(query, params);
    res.json(internships);
  } catch (error) {
    next(error);
  }
};

// Create internship (Faculty or Admin only)
const createInternship = async (req, res, next) => {
  try {
    const { company, title, description, stipend, location, type } = req.body;

    const [result] = await db.execute(`
      INSERT INTO internships (company, title, description, stipend, location, type, posted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [company, title, description, stipend, location, type || 'Internship', req.user.id]);

    res.status(201).json({ message: 'Internship posted', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

// Apply for internship
const applyForInternship = async (req, res, next) => {
  try {
    const { internship_id } = req.body;
    
    // Check if student
    const [student] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) {
      return res.status(403).json({ error: 'Only students can apply' });
    }

    const student_id = student[0].id;

    // Check if already applied
    const [existing] = await db.execute('SELECT * FROM internship_applications WHERE internship_id = ? AND student_id = ?', [internship_id, student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied' });
    }

    await db.execute('INSERT INTO internship_applications (internship_id, student_id) VALUES (?, ?)', [internship_id, student_id]);
    res.status(201).json({ message: 'Applied successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInternships,
  createInternship,
  applyForInternship
};
