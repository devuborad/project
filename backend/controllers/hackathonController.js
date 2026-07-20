const db = require('../config/db');

// Get hackathons for a club
const getHackathons = async (req, res, next) => {
  try {
    const [hackathons] = await db.execute(`
      SELECT h.*, c.name as club_name 
      FROM club_hackathons h 
      JOIN clubs c ON h.club_id = c.id
      ORDER BY h.start_date DESC
    `);
    res.json(hackathons);
  } catch (error) {
    next(error);
  }
};

// Create a new hackathon
const createHackathon = async (req, res, next) => {
  try {
    const { title, description, start_date, end_date, max_team_size, prize_pool, registration_link } = req.body;
    
    // Find the club this user manages
    const [clubs] = await db.execute('SELECT id FROM clubs WHERE admin_id = ?', [req.user.id]);
    if (clubs.length === 0) {
      return res.status(403).json({ error: 'You do not manage any club' });
    }
    const club_id = clubs[0].id;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO club_hackathons (club_id, title, description, start_date, end_date, max_team_size, prize_pool, registration_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [club_id, title, description || '', start_date, end_date, max_team_size || 4, prize_pool || '', registration_link || '']
    );

    const [newHackathon] = await db.execute('SELECT * FROM club_hackathons WHERE id = ?', [result.insertId]);
    res.status(201).json(newHackathon[0]);
  } catch (error) {
    next(error);
  }
};

// Delete a hackathon
const deleteHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [hackathons] = await db.execute(`
      SELECT h.id FROM club_hackathons h
      JOIN clubs c ON h.club_id = c.id
      WHERE h.id = ? AND c.admin_id = ?
    `, [id, req.user.id]);

    if (hackathons.length === 0) {
      return res.status(403).json({ error: 'Not authorized or hackathon not found' });
    }

    await db.execute('DELETE FROM club_hackathons WHERE id = ?', [id]);
    res.json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHackathons,
  createHackathon,
  deleteHackathon
};
