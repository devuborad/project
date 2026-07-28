/**
 * AI Memory Service (Long-Term Student Memory with LRU/TTL Cache)
 * Stores and retrieves student name, department, semester, recent chats,
 * uploaded notes count, study habits, quiz history, weak topics, preferred style, and FAQs.
 */

const db = require('../config/db');

class AiMemoryService {
  constructor() {
    // In-memory cache for high performance (TTL = 5 mins)
    this.memoryCache = new Map();
    this.CACHE_TTL_MS = 5 * 60 * 1000;
  }

  /**
   * Retrieves long-term memory for a user, using cache when available
   */
  async getMemory(userId) {
    if (!userId) return null;

    const cacheKey = `memory_${userId}`;
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const [rows] = await db.execute(
        `SELECT * FROM ai_memory WHERE user_id = ?`,
        [userId]
      );

      let memory;
      if (rows.length === 0) {
        // Initialize memory from users table
        const [userRows] = await db.execute(
          `SELECT first_name, last_name, role FROM users WHERE id = ?`,
          [userId]
        ).catch(() => [[{ first_name: 'Alex', last_name: 'Rivera', role: 'student' }]]);
        const name = userRows[0] ? (userRows[0].first_name + ' ' + (userRows[0].last_name || '')).trim() : 'Student';
        const defaultMemory = {
          user_id: userId,
          student_name: name,
          department: 'Computer Science & Engineering',
          semester: '6th Semester',
          recent_chats_json: [],
          uploaded_notes_count: 0,
          study_habits: 'Prefers step-by-step breakdowns and practical examples. Best study window: evenings.',
          quiz_history_json: [],
          weak_topics_json: ['Concurrency', 'Dynamic Programming', 'Deadlocks'],
          preferred_learning_style: 'Visual & Code Examples',
          frequently_asked_questions_json: []
        };

        await db.execute(
          `INSERT INTO ai_memory (
            user_id, student_name, department, semester, recent_chats_json,
            uploaded_notes_count, study_habits, quiz_history_json, weak_topics_json,
            preferred_learning_style, frequently_asked_questions_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            defaultMemory.student_name,
            defaultMemory.department,
            defaultMemory.semester,
            JSON.stringify(defaultMemory.recent_chats_json),
            defaultMemory.uploaded_notes_count,
            defaultMemory.study_habits,
            JSON.stringify(defaultMemory.quiz_history_json),
            JSON.stringify(defaultMemory.weak_topics_json),
            defaultMemory.preferred_learning_style,
            JSON.stringify(defaultMemory.frequently_asked_questions_json)
          ]
        );

        memory = defaultMemory;
      } else {
        const row = rows[0];
        memory = {
          user_id: row.user_id,
          student_name: row.student_name,
          department: row.department,
          semester: row.semester,
          recent_chats_json: typeof row.recent_chats_json === 'string' ? JSON.parse(row.recent_chats_json || '[]') : (row.recent_chats_json || []),
          uploaded_notes_count: row.uploaded_notes_count || 0,
          study_habits: row.study_habits || 'Prefers structured explanations and practice tests.',
          quiz_history_json: typeof row.quiz_history_json === 'string' ? JSON.parse(row.quiz_history_json || '[]') : (row.quiz_history_json || []),
          weak_topics_json: typeof row.weak_topics_json === 'string' ? JSON.parse(row.weak_topics_json || '[]') : (row.weak_topics_json || []),
          preferred_learning_style: row.preferred_learning_style || 'Visual & Code Examples',
          frequently_asked_questions_json: typeof row.frequently_asked_questions_json === 'string' ? JSON.parse(row.frequently_asked_questions_json || '[]') : (row.frequently_asked_questions_json || [])
        };
      }

      this.memoryCache.set(cacheKey, { timestamp: Date.now(), data: memory });
      return memory;
    } catch (error) {
      console.error('[AiMemoryService] getMemory error:', error);
      return null;
    }
  }

  /**
   * Updates student memory fields in MySQL and invalidates cache
   */
  async updateMemory(userId, updates = {}) {
    if (!userId) return false;

    try {
      const current = await this.getMemory(userId);
      if (!current) return false;

      const merged = { ...current, ...updates };

      // Ensure JSON formatting
      const recentChats = JSON.stringify(merged.recent_chats_json || []);
      const quizHistory = JSON.stringify(merged.quiz_history_json || []);
      const weakTopics = JSON.stringify(merged.weak_topics_json || []);
      const faqs = JSON.stringify(merged.frequently_asked_questions_json || []);

      await db.execute(
        `UPDATE ai_memory SET 
          student_name = ?, department = ?, semester = ?, recent_chats_json = ?,
          uploaded_notes_count = ?, study_habits = ?, quiz_history_json = ?,
          weak_topics_json = ?, preferred_learning_style = ?, frequently_asked_questions_json = ?
        WHERE user_id = ?`,
        [
          merged.student_name,
          merged.department,
          merged.semester,
          recentChats,
          merged.uploaded_notes_count,
          merged.study_habits,
          quizHistory,
          weakTopics,
          merged.preferred_learning_style,
          faqs,
          userId
        ]
      );

      // Invalidate cache
      this.memoryCache.delete(`memory_${userId}`);
      return true;
    } catch (error) {
      console.error('[AiMemoryService] updateMemory error:', error);
      return false;
    }
  }

  /**
   * Records a recent chat message pair into long-term memory (stores last 10 pairs)
   */
  async recordChat(userId, prompt, responseText, agentName = 'Study Agent') {
    try {
      const mem = await this.getMemory(userId);
      if (!mem) return;

      const chats = Array.isArray(mem.recent_chats_json) ? mem.recent_chats_json : [];
      chats.unshift({
        prompt,
        response: (responseText || '').substring(0, 200),
        agent: agentName,
        timestamp: new Date().toISOString()
      });

      // Keep only most recent 10 conversations in active memory
      const trimmed = chats.slice(0, 10);
      await this.updateMemory(userId, { recent_chats_json: trimmed });
    } catch (error) {
      console.error('[AiMemoryService] recordChat error:', error);
    }
  }

  /**
   * Builds a structured context string for injection into Gemini / Agent prompts
   */
  async buildMemoryContext(userId) {
    if (!userId) return '';
    try {
      const mem = await this.getMemory(userId);
      if (!mem) return '';

      const weakList = Array.isArray(mem.weak_topics_json) ? mem.weak_topics_json.join(', ') : '';
      const quizCount = Array.isArray(mem.quiz_history_json) ? mem.quiz_history_json.length : 0;

      return `
[STUDENT LONG-TERM MEMORY CONTEXT]
- Student Name: ${mem.student_name}
- Department: ${mem.department} | Semester: ${mem.semester}
- Preferred Learning Style: ${mem.preferred_learning_style}
- Study Habits: ${mem.study_habits}
- Identified Weak Topics: ${weakList || 'None recorded yet'}
- Uploaded Study Notes: ${mem.uploaded_notes_count} PDFs in knowledge base
- Quiz Practice Record: ${quizCount} quizzes attempted
[END MEMORY CONTEXT]
`.trim();
    } catch (error) {
      console.error('[AiMemoryService] buildMemoryContext error:', error);
      return '';
    }
  }
}

module.exports = new AiMemoryService();
