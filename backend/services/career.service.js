const db = require('../config/db');

class CareerService {
  /**
   * Saves a chat message to the database.
   */
  async saveMessage(userId, message, sender) {
    try {
      const query = `
        INSERT INTO career_chats 
        (user_id, message, sender) 
        VALUES (?, ?, ?)
      `;
      const [result] = await db.execute(query, [userId, message, sender]);
      return result.insertId;
    } catch (error) {
      console.error('[CareerService] DB Error saving message:', error);
      throw new Error('Failed to save message to database.');
    }
  }

  /**
   * Retrieves the chat history for a user.
   */
  async getHistory(userId) {
    try {
      const query = `
        SELECT id, message, sender, created_at 
        FROM career_chats 
        WHERE user_id = ? 
        ORDER BY created_at ASC
      `;
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      console.error('[CareerService] DB Error fetching history:', error);
      throw new Error('Failed to fetch chat history.');
    }
  }
}

module.exports = new CareerService();
