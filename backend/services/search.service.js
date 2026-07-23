const db = require('../config/db');

class SearchService {
  /**
   * Save a search query to history.
   */
  async saveHistory(userId, query) {
    try {
      const sql = 'INSERT INTO search_history (user_id, query) VALUES (?, ?)';
      await db.execute(sql, [userId, query]);
    } catch (error) {
      console.error('[SearchService] Failed to save search history:', error.message);
    }
  }

  /**
   * Retrieve unique recent searches for a user.
   */
  async getRecentSearches(userId) {
    try {
      const sql = 'SELECT query FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
      const [rows] = await db.execute(sql, [userId]);
      // Extract unique queries keeping the most recent order
      const unique = [...new Set(rows.map(r => r.query))].slice(0, 5);
      return unique;
    } catch (error) {
      console.error('[SearchService] Failed to fetch search history:', error.message);
      return [];
    }
  }
}

module.exports = new SearchService();
