const db = require('../config/db');

class QueryService {
  /**
   * Executes database queries based on intent and entities.
   * Returns an array of raw objects.
   */
  async executeQuery(intent, userId, entities) {
    try {
      let query = '';
      let params = [];
      
      const subj = entities.subject ? `%${entities.subject}%` : '%';
      const tech = entities.technology ? `%${entities.technology}%` : '%';
      const company = entities.company ? `%${entities.company}%` : '%';

      switch (intent) {
        case 'attendance':
          const [profile] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
          if (!profile || profile.length === 0) return [];
          
          if (entities.subject) {
             query = 'SELECT course as title, date as description, status FROM attendance WHERE student_id = ? AND course LIKE ? ORDER BY date DESC LIMIT 10';
             params = [profile[0].id, subj];
          } else {
             query = 'SELECT course as title, date as description, status FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 10';
             params = [profile[0].id];
          }
          break;

        case 'assignments':
          query = 'SELECT title, course as description, due_date FROM assignments WHERE due_date >= NOW() ORDER BY due_date ASC LIMIT 10';
          break;

        case 'events':
          query = 'SELECT e.title, e.description, e.event_date, e.location, c.name as club_name FROM events e JOIN clubs c ON e.club_id = c.id WHERE e.event_date >= NOW() ORDER BY e.event_date ASC LIMIT 10';
          break;

        case 'clubs':
          const clubName = entities.club_name ? `%${entities.club_name}%` : '%';
          query = 'SELECT name as title, description FROM clubs WHERE name LIKE ? LIMIT 10';
          params = [clubName];
          break;

        case 'notes':
          if (entities.subject) {
            query = 'SELECT title, subject as description, file_type FROM notes WHERE subject LIKE ? ORDER BY created_at DESC LIMIT 10';
            params = [subj];
          } else {
            query = 'SELECT title, subject as description, file_type FROM notes ORDER BY created_at DESC LIMIT 10';
          }
          break;

        case 'internships':
          query = 'SELECT title, company as description, type, location, stipend FROM internships WHERE company LIKE ? OR title LIKE ? ORDER BY created_at DESC LIMIT 10';
          params = [company, tech];
          break;
          
        case 'scholarships':
          // Mock data as table may not exist yet
          return [{ title: "Merit Scholarship", description: "For CGPA > 9.0", amount: "$1000" }];

        case 'notifications':
          query = 'SELECT message as title, created_at as description FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC LIMIT 5';
          params = [userId];
          break;

        case 'complaints':
          return [{ title: "Hostel WiFi", status: "In Progress", date: "2024-01-01" }];

        case 'profile':
          query = 'SELECT first_name, last_name, email, role FROM users WHERE id = ?';
          params = [userId];
          break;

        case 'timetable':
          return [{ time: "09:00 AM", subject: "Operating Systems", room: "LT-1" }, { time: "11:00 AM", subject: "React JS", room: "Lab 3" }];

        default:
          return [];
      }

      if (!query) return [];
      const [rows] = await db.execute(query, params);
      return rows;

    } catch (error) {
      console.error(`[QueryService] Error executing query for ${intent}:`, error.message);
      return [];
    }
  }
}

module.exports = new QueryService();
