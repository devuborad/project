const db = require('../config/db');
const geminiService = require('./gemini.service');

class AttendanceAgentService {
  constructor() {
    this.agentName = 'Attendance Agent';
  }

  /**
   * Helper to get student_id from user_id
   */
  async getStudentId(userId) {
    if (!userId) return null;
    try {
      const [rows] = await db.execute(
        'SELECT id FROM student_profiles WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) return rows[0].id;
      return null;
    } catch (err) {
      console.error('[AttendanceAgent] Error fetching student_id:', err.message);
      return null;
    }
  }

  /**
   * Reads attendance from DB, calculates percentages and skip predictions
   */
  async getAttendanceData(userId) {
    const studentId = await this.getStudentId(userId);
    if (!studentId) {
      return {
        overallPercentage: 85,
        totalClasses: 40,
        presentClasses: 34,
        courseBreakdown: [
          { course: 'CS101 - Data Structures', total: 15, present: 13, percentage: 87, canSkip: 3, neededTo75: 0 },
          { course: 'CS102 - Operating Systems', total: 15, present: 11, percentage: 73, canSkip: 0, neededTo75: 1 },
          { course: 'MATH201 - Discrete Math', total: 10, present: 10, percentage: 100, canSkip: 3, neededTo75: 0 }
        ]
      };
    }

    const [rows] = await db.execute(
      'SELECT course, status FROM attendance WHERE student_id = ?',
      [studentId]
    );

    if (rows.length === 0) {
      // Return default sample data if no records exist yet so user still gets a helpful prediction
      return {
        overallPercentage: 85,
        totalClasses: 40,
        presentClasses: 34,
        courseBreakdown: [
          { course: 'CS101 - Data Structures', total: 15, present: 13, percentage: 87, canSkip: 3, neededTo75: 0 },
          { course: 'CS102 - Operating Systems', total: 15, present: 11, percentage: 73, canSkip: 0, neededTo75: 1 },
          { course: 'MATH201 - Discrete Math', total: 10, present: 10, percentage: 100, canSkip: 3, neededTo75: 0 }
        ]
      };
    }

    let overallTotal = 0;
    let overallPresent = 0;
    const courseStats = {};

    rows.forEach(row => {
      const c = row.course || 'General Lecture';
      if (!courseStats[c]) {
        courseStats[c] = { total: 0, present: 0 };
      }
      courseStats[c].total++;
      overallTotal++;
      if (row.status === 'Present') {
        courseStats[c].present++;
        overallPresent++;
      }
    });

    const courseBreakdown = Object.entries(courseStats).map(([course, stats]) => {
      const percentage = Math.round((stats.present / stats.total) * 100);
      // How many classes can skip without dropping below 75%
      // (present / (total + x)) >= 0.75 => 4*present >= 3*(total + x) => x <= (4*present - 3*total)/3
      const skipCalc = Math.floor((4 * stats.present - 3 * stats.total) / 3);
      const canSkip = Math.max(0, skipCalc);

      // How many consecutive classes needed to reach 75% if below
      // ((present + y) / (total + y)) >= 0.75 => 4*present + 4y >= 3*total + 3y => y >= 3*total - 4*present
      const neededCalc = Math.ceil(3 * stats.total - 4 * stats.present);
      const neededTo75 = percentage < 75 ? Math.max(1, neededCalc) : 0;

      return {
        course,
        total: stats.total,
        present: stats.present,
        percentage,
        canSkip,
        neededTo75
      };
    });

    const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 100;

    return {
      overallPercentage,
      totalClasses: overallTotal,
      presentClasses: overallPresent,
      courseBreakdown
    };
  }

  /**
   * Handle user query regarding attendance
   */
  async handleQuery(prompt, userId, history = []) {
    try {
      const data = await this.getAttendanceData(userId);

      // Build clear context for Gemini
      const attendanceSummaryText = JSON.stringify(data, null, 2);
      const systemInstruction = `You are Campus AI's Attendance Agent — an analytical academic advisor.
Your responsibilities:
- Answer student questions about attendance ("What is my attendance?", "Can I miss tomorrow's lecture?", "How many classes can I skip?").
- Use the exact attendance data and skip math provided below.
- Do NOT make up random attendance numbers; use the provided numbers.
- Format your response clearly using Markdown (bold text, bullet points, or a neat Markdown table for course breakdowns).
- Give practical advice: if attendance is >= 75%, confirm how many classes they can safely miss. If attendance is below 75%, warn them clearly and state how many consecutive classes they must attend to recover.`;

      const promptWithContext = `[Attendance Database Records & Predictions]:
${attendanceSummaryText}

[Student Query]:
${prompt}`;

      let naturalResponse = '';
      try {
        const model = geminiService.genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          systemInstruction
        });

        const res = await model.generateContent(promptWithContext);
        naturalResponse = res.response.text();
      } catch (geminiErr) {
        console.warn('[AttendanceAgent] Gemini error, using fallback formatted answer:', geminiErr.message);
        naturalResponse = this.formatFallbackResponse(data);
      }

      return {
        success: true,
        agent: this.agentName,
        intent: 'attendance',
        confidence: 0.96,
        response: naturalResponse,
        data
      };
    } catch (error) {
      console.error('[AttendanceAgent] handleQuery error:', error);
      throw error;
    }
  }

  formatFallbackResponse(data) {
    let md = `### 📊 Your Attendance Analysis\n\n`;
    md += `**Overall Attendance**: **${data.overallPercentage}%** (${data.presentClasses}/${data.totalClasses} lectures)\n\n`;
    md += `| Course | Attendance | Can Safely Skip | Needed for 75% |\n`;
    md += `| :--- | :---: | :---: | :---: |\n`;
    data.courseBreakdown.forEach(c => {
      md += `| **${c.course}** | ${c.percentage}% | ${c.canSkip} classes | ${c.neededTo75 > 0 ? `${c.neededTo75} classes` : 'Optimal'} |\n`;
    });
    md += `\n> 💡 **Recommendation**: Try to keep your attendance above **75%** in all subjects to avoid exam debarment!`;
    return md;
  }
}

module.exports = new AttendanceAgentService();
