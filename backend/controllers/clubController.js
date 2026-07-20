const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Get all clubs
const getClubs = async (req, res, next) => {
  try {
    const [clubs] = await db.execute(`
      SELECT c.*, u.first_name AS admin_first, u.last_name AS admin_last
      FROM clubs c
      JOIN users u ON c.admin_id = u.id
    `);
    res.json(clubs);
  } catch (error) {
    next(error);
  }
};

// Create a club (Admin only for creation, or 'club_admin' role)
const createClub = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let logo_url = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'campus_ai/clubs'
      });
      logo_url = result.secure_url;
    }

    const [result] = await db.execute(`
      INSERT INTO clubs (name, description, logo_url, admin_id) VALUES (?, ?, ?, ?)
    `, [name, description, logo_url, req.user.id]);

    res.status(201).json({ message: 'Club created', clubId: result.insertId, logo_url });
  } catch (error) {
    next(error);
  }
};

// Join a club
const joinClub = async (req, res, next) => {
  try {
    const { club_id } = req.body;
    
    // Check if student
    const [student] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) {
      return res.status(403).json({ error: 'Only students can join clubs' });
    }

    const student_id = student[0].id;

    // Check if already in club
    const [existing] = await db.execute('SELECT * FROM club_members WHERE club_id = ? AND student_id = ?', [club_id, student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already a member of this club' });
    }

    await db.execute('INSERT INTO club_members (club_id, student_id) VALUES (?, ?)', [club_id, student_id]);
    res.status(201).json({ message: 'Joined club successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all members for a club managed by this user
const getClubMembers = async (req, res, next) => {
  try {
    const [clubs] = await db.execute('SELECT id FROM clubs WHERE admin_id = ?', [req.user.id]);
    if (clubs.length === 0) return res.status(403).json({ error: 'You do not manage any club' });
    const club_id = clubs[0].id;

    const [members] = await db.execute(`
      SELECT u.id as user_id, u.first_name, u.last_name, u.email, cm.role, cm.joined_at, sp.id as student_id
      FROM club_members cm
      JOIN student_profiles sp ON cm.student_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE cm.club_id = ?
    `, [club_id]);
    
    // Include the club admin as the "Leader" explicitly
    const [adminUser] = await db.execute('SELECT id as user_id, first_name, last_name, email FROM users WHERE id = ?', [req.user.id]);
    if (adminUser.length > 0) {
      members.unshift({ ...adminUser[0], role: 'Club Leader', joined_at: null, student_id: null });
    }

    res.json(members);
  } catch (error) {
    next(error);
  }
};

// Update member role
const updateMemberRole = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const { role } = req.body;

    const [clubs] = await db.execute('SELECT id FROM clubs WHERE admin_id = ?', [req.user.id]);
    if (clubs.length === 0) return res.status(403).json({ error: 'You do not manage any club' });
    const club_id = clubs[0].id;

    await db.execute('UPDATE club_members SET role = ? WHERE club_id = ? AND student_id = ?', [role, club_id, student_id]);
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubs,
  createClub,
  joinClub,
  getClubMembers,
  updateMemberRole
};
