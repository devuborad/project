const db = require('../config/db');

class DataAggregatorService {
  /**
   * Aggregates all relevant data for a student user.
   */
  async getStudentContext(userId) {
    try {
      // 1. Get Profile
      const [profileRows] = await db.execute(
        'SELECT u.first_name, u.last_name, u.email, sp.department, sp.semester, sp.cgpa, sp.skills, sp.interests FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ?', 
        [userId]
      );
      
      const profile = profileRows[0] || { note: 'No detailed student profile found.' };
      let studentId = null;
      
      // If we found a profile, we can get the student_id for attendance
      if (profileRows[0]) {
        const [sp] = await db.execute('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
        if (sp[0]) studentId = sp[0].id;
      }

      // 2. Get Attendance (Overall summary if possible, or just recent)
      let attendance = [];
      if (studentId) {
        const [attRows] = await db.execute('SELECT course, status FROM attendance WHERE student_id = ?', [studentId]);
        attendance = attRows;
      }

      // 3. Get Upcoming Assignments
      const [assignments] = await db.execute('SELECT title, course, due_date FROM assignments WHERE due_date >= NOW() LIMIT 10');

      // 4. Get Registered Events (Using club_members as a proxy for engagement if event_registrations table doesn't exist, or just fetch all recent campus events to recommend from)
      const [recentEvents] = await db.execute('SELECT title, event_date FROM events WHERE event_date >= NOW() LIMIT 5');

      return {
        profile,
        attendance_records: attendance,
        upcoming_assignments: assignments,
        campus_events: recentEvents
      };
    } catch (error) {
      console.error('[DataAggregator] Error aggregating data:', error);
      return { error: 'Failed to aggregate data.' };
    }
  }
}

module.exports = new DataAggregatorService();
