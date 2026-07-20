const db = require('../config/db');

const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.execute(
      'SELECT id, first_name, last_name, email, mobile_number, role, account_status, avatar_url, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'club_admin', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get current user to see old role
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentUser = existingUsers[0];

    // Delete old profile if transitioning away from student/faculty
    if (currentUser.role === 'student' && role !== 'student') {
        await db.execute('DELETE FROM student_profiles WHERE user_id = ?', [id]);
    } else if (currentUser.role === 'faculty' && role !== 'faculty') {
        await db.execute('DELETE FROM faculty_profiles WHERE user_id = ?', [id]);
    } else if (currentUser.role === 'admin' && role !== 'admin') {
        await db.execute('DELETE FROM admins WHERE user_id = ?', [id]);
    }

    // Create new profile if transitioning to student/faculty/admin
    if (role === 'student' && currentUser.role !== 'student') {
        await db.execute('INSERT IGNORE INTO student_profiles (user_id) VALUES (?)', [id]);
    } else if (role === 'faculty' && currentUser.role !== 'faculty') {
        await db.execute('INSERT IGNORE INTO faculty_profiles (user_id) VALUES (?)', [id]);
    } else if (role === 'admin' && currentUser.role !== 'admin') {
        await db.execute('INSERT IGNORE INTO admins (user_id, access_level) VALUES (?, ?)', [id, 'superadmin']);
    }

    await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    res.json({ message: 'User role updated successfully', role });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion if needed (optional)
    if (req.user.id === parseInt(id)) {
        return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const bcrypt = require('bcrypt');

const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, mobile_number, password, role } = req.body;

    if (!first_name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['student', 'faculty', 'club_admin', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (first_name, last_name, email, mobile_number, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name || '', email, mobile_number || null, password_hash, role]
    );

    const userId = result.insertId;

    // Create profile
    if (role === 'student') {
        await db.execute('INSERT INTO student_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'faculty') {
        await db.execute('INSERT INTO faculty_profiles (user_id) VALUES (?)', [userId]);
    } else if (role === 'admin') {
        await db.execute('INSERT INTO admins (user_id, access_level) VALUES (?, ?)', [userId, 'superadmin']);
    }

    const [newUsers] = await db.execute(
      'SELECT id, first_name, last_name, email, mobile_number, role, account_status, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json(newUsers[0]);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.execute('UPDATE users SET account_status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'User status updated successfully', status });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, ...rest } = req.body;

    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    const role = users[0].role;

    if (first_name || last_name) {
      await db.execute(`
        UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE id = ?
      `, [first_name, last_name, id]);
    }

    if (role === 'student') {
      const { major, graduation_year, bio, github_url, linkedin_url, prn_number } = rest;
      await db.execute(`
        UPDATE student_profiles 
        SET major = COALESCE(?, major), graduation_year = COALESCE(?, graduation_year), 
            bio = COALESCE(?, bio), github_url = COALESCE(?, github_url), 
            linkedin_url = COALESCE(?, linkedin_url), prn_number = COALESCE(?, prn_number)
        WHERE user_id = ?
      `, [major, graduation_year, bio, github_url, linkedin_url, prn_number, id]);
    } else if (role === 'faculty') {
      const { department, title, office_location } = rest;
      await db.execute(`
        UPDATE faculty_profiles 
        SET department = COALESCE(?, department), title = COALESCE(?, title), office_location = COALESCE(?, office_location)
        WHERE user_id = ?
      `, [department, title, office_location, id]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getClubRequests = async (req, res, next) => {
  try {
    const [requests] = await db.execute(`
      SELECT cm.club_id, c.name as club_name, cm.student_id, u.first_name, u.last_name, u.email, cm.sys_admin_approved, cm.club_admin_approved, cm.joined_at
      FROM club_members cm
      JOIN clubs c ON cm.club_id = c.id
      JOIN student_profiles sp ON cm.student_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE cm.sys_admin_approved = FALSE
    `);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

const approveClubRequest = async (req, res, next) => {
  try {
    const { club_id, student_id } = req.params;
    await db.execute('UPDATE club_members SET sys_admin_approved = TRUE WHERE club_id = ? AND student_id = ?', [club_id, student_id]);
    res.json({ message: 'System Admin approved club request' });
  } catch (error) {
    next(error);
  }
};

// Get System Admin Overview
const getOverview = async (req, res, next) => {
  try {
    const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ activeClubs }]] = await db.execute('SELECT COUNT(*) as activeClubs FROM clubs');
    const [[{ pendingApprovals }]] = await db.execute('SELECT COUNT(*) as pendingApprovals FROM club_members WHERE sys_admin_approved = FALSE');

    const [recentActivity] = await db.execute(`
      SELECT 'User Registration' as activity_type, CONCAT(first_name, ' ', last_name, ' joined CampusAI') as description, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 3
    `);

    res.json({
      totalUsers,
      activeClubs,
      pendingApprovals,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  updateUserStatus,
  updateUserProfile,
  getClubRequests,
  approveClubRequest,
  getOverview
};
