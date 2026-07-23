const db = require('../config/db');

class RecommendationService {
  async saveRecommendation(userId, recommendationsJson) {
    try {
      const query = `
        INSERT INTO recommendation_history (user_id, recommendations_json) 
        VALUES (?, ?)
      `;
      await db.execute(query, [userId, JSON.stringify(recommendationsJson)]);
    } catch (error) {
      console.error('[RecommendationService] Error saving:', error);
    }
  }

  async getLatestRecommendation(userId) {
    try {
      const query = `
        SELECT recommendations_json 
        FROM recommendation_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [userId]);
      return rows.length ? rows[0].recommendations_json : null;
    } catch (error) {
      console.error('[RecommendationService] Error fetching:', error);
      return null;
    }
  }
}

module.exports = new RecommendationService();
