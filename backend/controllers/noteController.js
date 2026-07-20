const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Get all notes (optionally filter by subject)
const getNotes = async (req, res, next) => {
  try {
    const { subject } = req.query;
    let query = `
      SELECT n.*, u.first_name, u.last_name, u.avatar_url 
      FROM notes n
      JOIN users u ON n.uploader_id = u.id
    `;
    const params = [];

    if (subject) {
      query += ' WHERE n.subject = ?';
      params.push(subject);
    }

    query += ' ORDER BY n.created_at DESC';

    const [notes] = await db.execute(query, params);
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// Upload a note
const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const { title, subject, file_type } = req.body;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'campus_ai/notes'
    });

    // Save to DB
    const [dbResult] = await db.execute(`
      INSERT INTO notes (uploader_id, title, subject, file_url, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, subject, result.secure_url, file_type || 'OTHER', req.file.size]);

    res.status(201).json({
      message: 'Note uploaded successfully',
      noteId: dbResult.insertId,
      file_url: result.secure_url
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [notes] = await db.execute('SELECT uploader_id FROM notes WHERE id = ?', [id]);
    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (notes[0].uploader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await db.execute('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  uploadNote,
  deleteNote
};
