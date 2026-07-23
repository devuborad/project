const db = require('../config/db');

class NotesAIService {
  /**
   * Saves the notes summary to the database.
   */
  async saveSummary(userId, fileName, summaryJson) {
    try {
      const query = `
        INSERT INTO notes_summaries 
        (user_id, file_name, summary_json) 
        VALUES (?, ?, ?)
      `;
      const jsonString = JSON.stringify(summaryJson);
      
      const [result] = await db.execute(query, [
        userId, 
        fileName, 
        jsonString
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('[NotesAIService] DB Error saving summary:', error);
      throw new Error('Failed to save summary to database.');
    }
  }
}

module.exports = new NotesAIService();
