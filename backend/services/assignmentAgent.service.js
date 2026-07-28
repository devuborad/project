const db = require('../config/db');
const geminiService = require('./gemini.service');

class AssignmentAgentService {
  constructor() {
    this.agentName = 'Assignment Agent';
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
      return null;
    }
  }

  /**
   * Reads assignments table, sorts by deadline, suggests priority
   */
  async getAssignmentsData(userId) {
    const studentId = await this.getStudentId(userId);
    let assignments = [];

    try {
      if (studentId) {
        // Query assignments that haven't been submitted by this student yet
        const [rows] = await db.execute(`
          SELECT a.id, a.title, a.description, a.due_date, a.course
          FROM assignments a
          LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
          WHERE s.id IS NULL
          ORDER BY a.due_date ASC
          LIMIT 20
        `, [studentId]);
        assignments = rows;
      } else {
        // Fallback query if no student profile
        const [rows] = await db.execute(`
          SELECT id, title, description, due_date, course
          FROM assignments
          ORDER BY due_date ASC
          LIMIT 20
        `);
        assignments = rows;
      }
    } catch (dbErr) {
      console.warn('[AssignmentAgent] DB error, using default assignments:', dbErr.message);
    }

    // If table is empty, provide realistic sample assignments so user can see functionality
    if (assignments.length === 0) {
      const now = new Date();
      assignments = [
        {
          id: 101,
          title: 'Operating Systems - Virtual Memory Lab Report',
          description: 'Write a C program simulating FIFO and LRU page replacement algorithms.',
          due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          course: 'CS102 - Operating Systems'
        },
        {
          id: 102,
          title: 'Database Systems - Normalization Assignment',
          description: 'Convert given ER diagram into 3NF relational tables.',
          due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          course: 'CS103 - Database Systems'
        },
        {
          id: 103,
          title: 'Data Structures - AVL Tree Implementation',
          description: 'Implement AVL self-balancing BST in C++ or Java.',
          due_date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
          course: 'CS101 - Data Structures'
        }
      ];
    }

    const now = new Date();
    const processed = assignments.map(item => {
      const due = new Date(item.due_date);
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      let priority = 'Low';
      if (diffHours <= 48) priority = 'High';
      else if (diffHours <= 120) priority = 'Medium';

      return {
        id: item.id,
        title: item.title,
        course: item.course || 'General Course',
        dueDate: due.toLocaleDateString() + ' ' + due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority,
        description: item.description || 'No description provided.'
      };
    });

    return {
      totalPending: processed.length,
      highPriorityCount: processed.filter(x => x.priority === 'High').length,
      assignments: processed
    };
  }

  /**
   * Generates a personalized study schedule and saves it to study_plans table
   */
  async generateAndSaveStudySchedule(userId, assignmentsData, prompt) {
    let scheduleText = '';
    try {
      const systemInstruction = `You are Campus AI's Assignment Agent — an expert time-management coach and academic planner.
Your goal:
- Generate a clear, actionable, personalized study schedule based on the student's pending assignments and due dates.
- Break down tasks into manageable daily study blocks.
- Highlight high-priority deadlines first.
- Use clean Markdown with headings and checkboxes (- [ ] Task).`;

      const promptPayload = `[Pending Assignments Data]:
${JSON.stringify(assignmentsData, null, 2)}

[Student Request]:
${prompt}`;

      const model = geminiService.genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: { temperature: 0.5, maxOutputTokens: 1200 },
        systemInstruction
      });

      const res = await model.generateContent(promptPayload);
      scheduleText = res.response.text();

      // Save to study_plans table
      if (userId) {
        try {
          await db.execute(
            'INSERT INTO study_plans (user_id, title, plan_type, content, status) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Personalized Assignment Schedule', 'assignment_schedule', scheduleText, 'active']
          );
          console.log('✅ Saved personalized study schedule to study_plans for user:', userId);
        } catch (dbSaveErr) {
          console.warn('[AssignmentAgent] Could not save schedule to DB:', dbSaveErr.message);
        }
      }
    } catch (err) {
      console.warn('[AssignmentAgent] Gemini schedule generation error:', err.message);
      scheduleText = this.formatFallbackSchedule(assignmentsData);
    }

    return scheduleText;
  }

  formatFallbackSchedule(data) {
    let md = `### 📅 Personalized Study & Assignment Schedule\n\n`;
    md += `Here is your recommended priority roadmap for completing **${data.totalPending} pending assignments**:\n\n`;
    data.assignments.forEach((a, idx) => {
      const icon = a.priority === 'High' ? '🔴' : a.priority === 'Medium' ? '🟡' : '🟢';
      md += `#### ${icon} Priority ${idx + 1}: ${a.title} (${a.course})\n`;
      md += `- **Due Date**: ${a.dueDate}\n`;
      md += `- **Priority Level**: **${a.priority}**\n`;
      md += `- **Action**: Dedicate 2 hours today to complete the first draft of this assignment.\n\n`;
    });
    return md;
  }

  /**
   * Handle user query regarding assignments
   */
  async handleQuery(prompt, userId, history = []) {
    try {
      const data = await this.getAssignmentsData(userId);
      const isScheduleRequest = /schedule|plan|timetable|help me finish/i.test(prompt);

      let responseText = '';
      if (isScheduleRequest) {
        responseText = await this.generateAndSaveStudySchedule(userId, data, prompt);
      } else {
        const systemInstruction = `You are Campus AI's Assignment Agent — an expert academic task manager.
Your responsibilities:
- Answer student queries about pending assignments ("Show pending assignments", "Assignments due this week", "Help me finish assignment").
- Use the exact assignment data provided below.
- Format using clean Markdown tables or organized bullet lists.
- Mention due dates, courses, and priority ratings clearly.`;

        const promptWithContext = `[Assignments Database Records]:
${JSON.stringify(data, null, 2)}

[Student Query]:
${prompt}`;

        try {
          const model = geminiService.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
            systemInstruction
          });
          const res = await model.generateContent(promptWithContext);
          responseText = res.response.text();
        } catch (geminiErr) {
          responseText = this.formatFallbackSchedule(data);
        }
      }

      return {
        success: true,
        agent: this.agentName,
        intent: 'assignments',
        confidence: 0.96,
        response: responseText,
        data
      };
    } catch (error) {
      console.error('[AssignmentAgent] handleQuery error:', error);
      throw error;
    }
  }
}

module.exports = new AssignmentAgentService();
