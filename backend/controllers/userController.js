const db = require('../config/db');

// Get my full profile based on role
const getMyProfile = async (req, res, next) => {
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];

    let profile = { ...user };
    delete profile.password_hash; // Don't send password hash

    if (user.role === 'student') {
      const [studentData] = await db.execute('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
      if (studentData.length > 0) {
        profile = { ...profile, ...studentData[0] };
      }
    } else if (user.role === 'faculty') {
      const [facultyData] = await db.execute('SELECT * FROM faculty_profiles WHERE user_id = ?', [user.id]);
      if (facultyData.length > 0) {
        profile = { ...profile, ...facultyData[0] };
      }
    } else if (user.role === 'admin') {
      const [adminData] = await db.execute('SELECT * FROM admins WHERE user_id = ?', [user.id]);
      if (adminData.length > 0) {
        profile = { ...profile, ...adminData[0] };
      }
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// Update my profile based on role
const updateMyProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, ...rest } = req.body;

    // Make sure user exists
    const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const role = users[0].role;

    // Update users table for name changes
    if (first_name || last_name) {
      await db.execute(`
        UPDATE users 
        SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name)
        WHERE id = ?
      `, [first_name, last_name, req.user.id]);
    }

    // Update role-specific table
    if (role === 'student') {
      const { major, graduation_year, bio, github_url, linkedin_url, prn_number } = rest;
      await db.execute(`
        UPDATE student_profiles 
        SET major = COALESCE(?, major), 
            graduation_year = COALESCE(?, graduation_year), 
            bio = COALESCE(?, bio), 
            github_url = COALESCE(?, github_url), 
            linkedin_url = COALESCE(?, linkedin_url),
            prn_number = COALESCE(?, prn_number)
        WHERE user_id = ?
      `, [major, graduation_year, bio, github_url, linkedin_url, prn_number, req.user.id]);
    } else if (role === 'faculty') {
      const { department, title, office_location } = rest;
      await db.execute(`
        UPDATE faculty_profiles 
        SET department = COALESCE(?, department), 
            title = COALESCE(?, title), 
            office_location = COALESCE(?, office_location)
        WHERE user_id = ?
      `, [department, title, office_location, req.user.id]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload Avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Using local storage for now (from multer diskStorage in upload.js)
    // In production with cloudinary, req.file.path would be the cloudinary URL if configured that way.
    // Assuming local:
    const avatarUrl = 'http://localhost:5000/uploads/' + req.file.filename;

    await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);

    res.json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar
};
