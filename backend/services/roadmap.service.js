const db = require('../config/db');

class RoadmapService {
  /**
   * Saves the roadmap to the database.
   */
  async saveRoadmap(userId, goal, generatedJson) {
    try {
      const query = `
        INSERT INTO roadmap_history 
        (user_id, goal, generated_json) 
        VALUES (?, ?, ?)
      `;
      const jsonString = JSON.stringify(generatedJson);
      
      const [result] = await db.execute(query, [
        userId, 
        goal, 
        jsonString
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('[RoadmapService] DB Error saving roadmap:', error);
      throw new Error('Failed to save roadmap to database.');
    }
  }
}

module.exports = new RoadmapService();
