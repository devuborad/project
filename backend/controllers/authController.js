const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, mobile_number, role, accessCode, prn_number, major, department } = req.body;
    const userRole = role || 'student';

    // For Faculty and Club Admin, set status to pending. Others are active.
    let accountStatus = 'active';
    if (userRole === 'faculty' || userRole === 'club_admin') {
      accountStatus = 'pending';
    }

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (first_name, last_name, email, mobile_number, password_hash, role, account_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, mobile_number || null, password_hash, userRole, accountStatus]
    );

    const userId = result.insertId;

    // Create profile based on role
    if (userRole === 'student') {
      await db.execute('INSERT INTO student_profiles (user_id, prn_number, major) VALUES (?, ?, ?)', [userId, prn_number || null, major || null]);
    } else if (userRole === 'faculty') {
      await db.execute('INSERT INTO faculty_profiles (user_id, department) VALUES (?, ?)', [userId, department || null]);
    } else if (userRole === 'admin') {
      await db.execute('INSERT INTO admins (user_id, access_level) VALUES (?, ?)', [userId, 'superadmin']);
    }

    if (accountStatus === 'pending') {
      res.status(201).json({
        message: 'Registration successful. Your account is pending approval by the System Admin.',
        pending: true
      });
    } else {
      const token = generateToken(userId, userRole);
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: userId, first_name, last_name, email, role: userRole },
        token
      });
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    if (role && user.role !== role) {
      return res.status(401).json({ error: `Account exists but is not registered as a ${role}` });
    }

    if (user.account_status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending approval by the System Admin.' });
    }
    if (user.account_status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await db.execute(
      'SELECT id, first_name, last_name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
