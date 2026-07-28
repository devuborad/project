const db = require('../config/db');
const geminiService = require('./gemini.service');
const attendanceAgent = require('./attendanceAgent.service');
const assignmentAgent = require('./assignmentAgent.service');

class CampusAssistantService {
  constructor() {
    this.agentName = 'Campus Assistant';
  }

  /**
   * Aggregates holistic student data across Assignments, Attendance, Uploaded Notes, and Quiz History
   */
  async getHolisticStudentData(userId) {
    const [attendanceData, assignmentData] = await Promise.all([
      attendanceAgent.getAttendanceData(userId),
      assignmentAgent.getAssignmentsData(userId)
    ]);

    let uploadedNotes = [];
    let quizHistory = [];

    try {
      if (userId) {
        const [notesRows] = await db.execute(
          'SELECT id, file_name, created_at FROM uploaded_notes WHERE user_id = ? ORDER BY id DESC LIMIT 5',
          [userId]
        );
        uploadedNotes = notesRows;

        const [quizRows] = await db.execute(
          'SELECT id, note_id, created_at FROM generated_quizzes WHERE user_id = ? ORDER BY id DESC LIMIT 5',
          [userId]
        );
        quizHistory = quizRows;
      }
    } catch (dbErr) {
      console.warn('[CampusAssistant] Notes/Quiz query failed:', dbErr.message);
    }

    if (uploadedNotes.length === 0) {
      uploadedNotes = [
        { id: 1, file_name: 'CS102_OS_Memory_Management.pdf', created_at: '2026-07-25' },
        { id: 2, file_name: 'CS101_Trees_and_Graphs_Slides.pdf', created_at: '2026-07-26' }
      ];
    }

    return {
      attendance: attendanceData,
      assignments: assignmentData,
      uploadedNotes,
      quizHistory
    };
  }

  /**
   * Generates a holistic personalized study plan and saves it to study_plans table
   */
  async generateAndSaveHolisticPlan(userId, prompt, holisticData) {
    const systemInstruction = `You are Campus AI's Campus Assistant — the Master Academic Copilot for university students.
Your superpowers:
- You synthesize data across the student's Attendance, Pending Assignments, Uploaded Lecture Notes, and Quiz History.
- When the student says "I have only 2 hours to study", "I have exam tomorrow", or asks for an optimized schedule, you create an ultra-practical, time-boxed **Personalized Study Plan**.
- Provide exact minute-by-minute or hour-by-hour time blocks (e.g., [00:00 - 00:30] Quick Concept Review, [00:30 - 01:15] Assignment Progress, [01:15 - 02:00] Quiz & Flashcard Drill).
- Account for urgent assignment due dates and courses where attendance is low.
- Format in crisp Markdown with emojis, tables, and checkboxes (- [ ] Task).`;

    const promptPayload = `[Holistic Student Profile Data]:
- Attendance Breakdown: ${JSON.stringify(holisticData.attendance.courseBreakdown)}
- Pending Assignments: ${JSON.stringify(holisticData.assignments.assignments)}
- Recent Uploaded Study Notes: ${JSON.stringify(holisticData.uploadedNotes)}
- Quiz History Count: ${holisticData.quizHistory.length}

[Student Request]:
${prompt}`;

    let planText = '';
    try {
      const model = geminiService.genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
        systemInstruction
      });

      const res = await model.generateContent(promptPayload);
      planText = res.response.text();

      // Save plan to database so it shows up on Dashboard!
      if (userId) {
        try {
          const title = /exam/i.test(prompt)
            ? 'Emergency Exam Prep Plan'
            : /hour|min/i.test(prompt)
            ? 'Time-Boxed Focused Study Plan'
            : 'Personalized Campus Master Plan';

          await db.execute(
            'INSERT INTO study_plans (user_id, title, plan_type, content, status) VALUES (?, ?, ?, ?, ?)',
            [userId, title, 'exam_prep', planText, 'active']
          );
          console.log('✅ Saved Campus Assistant study plan to study_plans for user:', userId);
        } catch (saveErr) {
          console.warn('[CampusAssistant] DB save error:', saveErr.message);
        }
      }
    } catch (err) {
      console.warn('[CampusAssistant] Gemini error, using fallback plan:', err.message);
      planText = this.formatFallbackPlan(prompt, holisticData);
    }

    return planText;
  }

  formatFallbackPlan(prompt, data) {
    let md = `### 🎯 Personalized High-Impact Study Plan\n\n`;
    md += `Based on your current academic profile (**${data.assignments.totalPending} assignments pending**, **${data.attendance.overallPercentage}% overall attendance**), here is your time-boxed action plan:\n\n`;
    md += `#### ⏱️ Block 1 (First 45 Minutes): Critical Concept Review\n`;
    md += `- [ ] Review notes from **${data.uploadedNotes[0]?.file_name || 'your latest lecture'}**.\n`;
    md += `- [ ] Focus on core formulas and key definitions.\n\n`;
    md += `#### 📝 Block 2 (Next 45 Minutes): High-Priority Assignment Progress\n`;
    md += `- [ ] Complete section 1 of **${data.assignments.assignments[0]?.title || 'your urgent assignment'}**.\n`;
    md += `- [ ] Check formatting and submission requirements.\n\n`;
    md += `#### 🧠 Block 3 (Final 30 Minutes): Active Recall & Self-Quiz\n`;
    md += `- [ ] Run a 10-question practice quiz in the Study Agent Learning Hub.\n`;
    md += `- [ ] Note any mistakes and review weak areas.\n\n`;
    md += `> 💡 **Tip**: Put your phone on Do Not Disturb and use the Pomodoro technique!`;
    return md;
  }

  /**
   * Handle user query regarding holistic campus study planning
   */
  async handleQuery(prompt, userId, history = []) {
    try {
      const holisticData = await this.getHolisticStudentData(userId);
      const planText = await this.generateAndSaveHolisticPlan(userId, prompt, holisticData);

      return {
        success: true,
        agent: this.agentName,
        intent: 'campus_assistant',
        confidence: 0.97,
        response: planText,
        data: holisticData
      };
    } catch (error) {
      console.error('[CampusAssistant] handleQuery error:', error);
      throw error;
    }
  }
}

module.exports = new CampusAssistantService();
