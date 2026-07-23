const db = require('../config/db');

class ResumeService {
  /**
   * Saves the resume review to the database.
   */
  async saveReview(userId, fileName, resumeUrl, atsScore, analysisJson) {
    try {
      const query = `
        INSERT INTO resume_reviews 
        (user_id, file_name, resume_url, ats_score, analysis_json) 
        VALUES (?, ?, ?, ?, ?)
      `;
      // analysis_json needs to be a string when inserted into a JSON column
      const jsonString = JSON.stringify(analysisJson);
      
      const [result] = await db.execute(query, [
        userId, 
        fileName, 
        resumeUrl || null, 
        atsScore, 
        jsonString
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('[ResumeService] DB Error saving review:', error);
      throw new Error('Failed to save resume analysis to database.');
    }
  }
}

module.exports = new ResumeService();
