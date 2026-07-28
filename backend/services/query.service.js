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
          const studentId = profile[0].id;

          let attendanceQuery = 'SELECT course, status FROM attendance WHERE student_id = ?';
          let queryParams = [studentId];
          
          if (entities.subject) {
             attendanceQuery += ' AND course LIKE ?';
             queryParams.push(subj);
          }
          
          const [attendanceRows] = await db.execute(attendanceQuery, queryParams);
          if (attendanceRows.length === 0) {
            return []; // Will trigger "No attendance records were found for your account."
          }

          // Calculate subject-wise and overall
          let overallTotal = 0;
          let overallPresent = 0;
          const subjectStats = {};

          attendanceRows.forEach(row => {
            if (!subjectStats[row.course]) {
              subjectStats[row.course] = { total: 0, present: 0 };
            }
            subjectStats[row.course].total++;
            overallTotal++;
            
            if (row.status === 'Present') {
              subjectStats[row.course].present++;
              overallPresent++;
            }
          });

          let resultText = 'Student Attendance\n\n';
          
          for (const [course, stats] of Object.entries(subjectStats)) {
            const percentage = Math.round((stats.present / stats.total) * 100);
            resultText += `${course} : ${percentage}%\n`;
            if (percentage < 75) {
              const reqClasses = Math.ceil((0.75 * stats.total - stats.present) / 0.25);
              resultText += `(Needs to attend ${reqClasses} more consecutive classes to reach 75%)\n`;
            }
          }

          const overallPercentage = Math.round((overallPresent / overallTotal) * 100);
          resultText += `\nOverall : ${overallPercentage}%\n`;
          if (overallPercentage < 75) {
            const overallReq = Math.ceil((0.75 * overallTotal - overallPresent) / 0.25);
            resultText += `(Needs to attend ${overallReq} more consecutive classes overall to reach 75%)\n`;
          }

          return [{ context: resultText }];

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
