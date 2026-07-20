const db = require('../config/db');

// Get events for a club
const getEvents = async (req, res, next) => {
  try {
    const [events] = await db.execute(`
      SELECT e.*, c.name as club_name 
      FROM events e 
      JOIN clubs c ON e.club_id = c.id
      ORDER BY e.event_date DESC
    `);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Create a new event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, location } = req.body;
    
    // Find the club this user manages
    const [clubs] = await db.execute('SELECT id FROM clubs WHERE admin_id = ?', [req.user.id]);
    if (clubs.length === 0) {
      return res.status(403).json({ error: 'You do not manage any club' });
    }
    const club_id = clubs[0].id;

    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO events (club_id, title, description, event_date, location) VALUES (?, ?, ?, ?, ?)',
      [club_id, title, description || '', event_date, location || '']
    );

    const [newEvent] = await db.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    next(error);
  }
};

// Delete an event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [events] = await db.execute(`
      SELECT e.id FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.id = ? AND c.admin_id = ?
    `, [id, req.user.id]);

    if (events.length === 0) {
      return res.status(403).json({ error: 'Not authorized or event not found' });
    }

    await db.execute('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  deleteEvent
};
