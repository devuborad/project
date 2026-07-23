const db = require('../config/db');

class ContextBuilder {
  /**
   * Fetch relevant context based on intent and user_id.
   * @param {string} intent 
   * @param {number} userId 
   * @returns {Promise<string|null>}
   */
  async getContext(intent, userId) {
    try {
      switch (intent) {
        case 'events':
          return await this.getEventsContext();
        case 'clubs':
          return await this.getClubsContext();
        case 'notes':
          return await this.getNotesContext();
        case 'assignments':
          return await this.getAssignmentsContext();
        case 'attendance':
          return await this.getAttendanceContext(userId);
        case 'internships':
          return await this.getInternshipsContext();
        case 'notifications':
          return await this.getNotificationsContext(userId);
        default:
          return null; // No database context needed for general chat
      }
    } catch (error) {
      console.error(`[ContextBuilder] Error fetching context for ${intent}:`, error.message);
      return null;
    }
  }

  async getEventsContext() {
    const [rows] = await db.execute(`
      SELECT e.title, e.description, e.event_date, e.location, c.name as club_name
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE e.event_date >= NOW()
      ORDER BY e.event_date ASC
      LIMIT 5
    `);
    if (!rows || rows.length === 0) return "No upcoming events found.";
    return "Upcoming Events Context:\n" + rows.map(r => `- "${r.title}" hosted by ${r.club_name} on ${r.event_date} at ${r.location}. Description: ${r.description}`).join("\n");
  }

  async getClubsContext() {
    const [rows] = await db.execute(`
      SELECT name, description FROM clubs LIMIT 10
    `);
    if (!rows || rows.length === 0) return "No clubs found on campus.";
    return "Campus Clubs Context:\n" + rows.map(r => `- ${r.name}: ${r.description}`).join("\n");
  }

  async getNotesContext() {
    const [rows] = await db.execute(`
      SELECT title, subject, file_type FROM notes ORDER BY created_at DESC LIMIT 10
    `);
    if (!rows || rows.length === 0) return "No study notes available.";
    return "Recent Study Notes Context:\n" + rows.map(r => `- ${r.title} (Subject: ${r.subject}, Type: ${r.file_type})`).join("\n");
  }

  async getAssignmentsContext() {
    const [rows] = await db.execute(`
      SELECT title, course, due_date, description 
      FROM assignments 
      WHERE due_date >= NOW() 
      ORDER BY due_date ASC 
      LIMIT 5
    `);
    if (!rows || rows.length === 0) return "There are no upcoming assignments.";
    return "Upcoming Assignments Context:\n" + rows.map(r => `- "${r.title}" for course ${r.course} due on ${r.due_date}. ${r.description}`).join("\n");
  }

  async getAttendanceContext(userId) {
    // Look up student profile using user_id
    const [studentProfile] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
    if (!studentProfile || studentProfile.length === 0) return "Attendance records not found for this user (User might not be a student).";
    
    const studentId = studentProfile[0].id;
    const [rows] = await db.execute(`
      SELECT course, date, status 
      FROM attendance 
      WHERE student_id = ? 
      ORDER BY date DESC 
      LIMIT 10
    `, [studentId]);
    if (!rows || rows.length === 0) return "No attendance records available for this student.";
    return "Recent Attendance Context:\n" + rows.map(r => `- Course: ${r.course}, Date: ${r.date}, Status: ${r.status}`).join("\n");
  }

  async getInternshipsContext() {
    const [rows] = await db.execute(`
      SELECT company, title, type, location, stipend 
      FROM internships 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    if (!rows || rows.length === 0) return "No internship opportunities available at the moment.";
    return "Recent Internships and Opportunities Context:\n" + rows.map(r => `- ${r.title} at ${r.company} (${r.type}). Location: ${r.location}. Stipend: ${r.stipend}`).join("\n");
  }

  async getNotificationsContext(userId) {
    const [rows] = await db.execute(`
      SELECT message, created_at 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [userId]);
    if (!rows || rows.length === 0) return "User has no unread notifications.";
    return "Unread Notifications Context:\n" + rows.map(r => `- ${r.message} (Received: ${r.created_at})`).join("\n");
  }

  async getFacultyContext() {
    const [rows] = await db.execute(`
      SELECT u.first_name, u.last_name, u.email, f.department, f.designation 
      FROM users u 
      JOIN faculty_profiles f ON u.id = f.user_id 
      WHERE u.role = 'faculty' 
      LIMIT 10
    `);
    if (!rows || rows.length === 0) return "No faculty found.";
    return "Faculty Context:\n" + rows.map(r => `- ${r.first_name} ${r.last_name} (${r.designation}, ${r.department}) - Email: ${r.email}`).join("\n");
  }

  /**
   * Fetch raw rows for semantic search results UI.
   * @param {string} intent 
   * @param {number} userId 
   * @returns {Promise<Array>}
   */
  async getRawContext(intent, userId) {
    try {
      let query = '';
      let params = [];
      switch (intent) {
        case 'events':
          query = `SELECT e.title, e.description, e.event_date, e.location, c.name as club_name FROM events e JOIN clubs c ON e.club_id = c.id WHERE e.event_date >= NOW() ORDER BY e.event_date ASC LIMIT 10`;
          break;
        case 'clubs':
          query = `SELECT name as title, description FROM clubs LIMIT 10`;
          break;
        case 'notes':
          query = `SELECT title, subject as description, file_type FROM notes ORDER BY created_at DESC LIMIT 10`;
          break;
        case 'assignments':
          query = `SELECT title, course as description, due_date FROM assignments WHERE due_date >= NOW() ORDER BY due_date ASC LIMIT 10`;
          break;
        case 'attendance':
          const [profile] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
          if (!profile || profile.length === 0) return [];
          query = `SELECT course as title, date as description, status FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 10`;
          params = [profile[0].id];
          break;
        case 'internships':
          query = `SELECT title, company as description, type, location, stipend FROM internships ORDER BY created_at DESC LIMIT 10`;
          break;
        case 'notifications':
          query = `SELECT message as title, created_at as description FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC LIMIT 10`;
          params = [userId];
          break;
        case 'faculty':
          query = `SELECT CONCAT(u.first_name, ' ', u.last_name) as title, CONCAT(f.designation, ' - ', f.department) as description, u.email FROM users u JOIN faculty_profiles f ON u.id = f.user_id WHERE u.role = 'faculty' LIMIT 10`;
          break;
        default:
          return [];
      }
      if (!query) return [];
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error(`[ContextBuilder] Error fetching raw context for ${intent}:`, error.message);
      return [];
    }
  }
}

module.exports = new ContextBuilder();
