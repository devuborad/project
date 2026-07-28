const geminiService = require('../services/gemini.service');
const agentRouter = require('../services/agentRouter.service');
const attendanceAgent = require('../services/attendanceAgent.service');
const assignmentAgent = require('../services/assignmentAgent.service');
const careerAgent = require('../services/careerAgent.service');
const db = require('../config/db');
const pdfParse = require('pdf-parse');

/**
 * Helper to fetch recent chat history for a user
 */
async function getChatHistory(userId, limit = 6) {
  if (!userId) return [];
  try {
    const [rows] = await db.execute(
      'SELECT prompt, response FROM ai_chats WHERE user_id = ? ORDER BY id DESC LIMIT ?',
      [userId, limit]
    );
    rows.reverse();
    const history = [];
    for (const row of rows) {
      history.push({ role: 'User', text: row.prompt });
      history.push({ role: 'AI', text: row.response });
    }
    return history;
  } catch (err) {
    console.error('[AI Controller] Error fetching history:', err.message);
    return [];
  }
}

/**
 * Handles the AI chat endpoint logic using Multi-Agent Router (AgentRouterService).
 */
const chat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ success: false, error: 'A valid prompt string is required' });
    }

    let finalPrompt = prompt;
    let imagePart = null;

    // Process attached file if any
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          finalPrompt += `\n\n[Attached PDF Content]:\n${pdfData.text}`;
        } catch (err) {
          console.error('[AI Controller] PDF Parse Error:', err);
        }
      } else if (req.file.mimetype.startsWith('image/')) {
        imagePart = {
          inlineData: {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype
          }
        };
      }
    }

    // 1. Fetch Conversation History (Memory)
    const history = await getChatHistory(userId, 6);

    // 2. Delegate to Multi-Agent Router
    const startRoute = Date.now();
    const result = await agentRouter.routeAndExecute(finalPrompt, userId, history, { imagePart });
    const elapsedMs = Date.now() - startRoute;

    console.log(`[Multi-Agent Chat] Agent: ${result.agent} | Intent: ${result.intent} | Confidence: ${result.confidence} | Time: ${elapsedMs}ms`);

    // 3. Log to ai_chats for backward compatibility
    if (userId) {
       try {
         await db.execute(
           'INSERT INTO ai_chats (user_id, prompt, response) VALUES (?, ?, ?)',
           [userId, prompt, result.response]
         );
       } catch (dbError) {
         console.error('[AI Controller] Database Logging Error:', dbError.message);
       }
    }

    // 4. Return Structured Multi-Agent Response
    return res.status(200).json({ 
      success: true,
      agent: result.agent,
      intent: result.intent,
      confidence: result.confidence,
      response: result.response,
      data: result.data,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('[AI Controller] Chat Error:', error);
    next(error); 
  }
};

/**
 * GET /api/ai/suggestions - Provides personalized Multi-Agent suggestions for Dashboard
 */
const getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // Execute parallel data aggregation from specialized agents
    const [attendanceData, assignmentsData] = await Promise.all([
      attendanceAgent.getAttendanceData(userId),
      assignmentAgent.getAssignmentsData(userId)
    ]);

    // Check if user has an active study plan
    let todayStudyGoal = {
      id: null,
      title: 'Complete 2 hours of focused assignment work',
      content: '- [ ] Complete draft for urgent assignment\n- [ ] Review 1 lecture slide deck in Learning Hub\n- [ ] Test recall with a 5-question practice quiz',
      source: 'default'
    };

    if (userId) {
      try {
        const [planRows] = await db.execute(
          'SELECT id, title, content, created_at FROM study_plans WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1',
          [userId]
        );
        if (planRows.length > 0) {
          todayStudyGoal = {
            id: planRows[0].id,
            title: planRows[0].title,
            content: planRows[0].content,
            source: 'study_plans'
          };
        }
      } catch (e) {
        console.warn('[AI Controller] Could not load study plan:', e.message);
      }
    }

    const topAssignment = assignmentsData.assignments[0] || null;

    const attendanceAlert = {
      status: attendanceData.overallPercentage >= 75 ? 'Optimal' : 'Low',
      percentage: attendanceData.overallPercentage,
      message: attendanceData.overallPercentage >= 75
        ? `Optimal attendance! You can safely skip up to ${attendanceData.courseBreakdown[0]?.canSkip || 2} lectures in ${attendanceData.courseBreakdown[0]?.course || 'your classes'}.`
        : `Warning: Overall attendance is ${attendanceData.overallPercentage}%. Attend the next ${attendanceData.courseBreakdown[0]?.neededTo75 || 3} lectures without skipping.`
    };

    const upcomingAssignment = topAssignment ? {
      title: topAssignment.title,
      course: topAssignment.course,
      dueDate: topAssignment.dueDate,
      priority: topAssignment.priority,
      totalPending: assignmentsData.totalPending
    } : {
      title: 'No urgent assignments pending',
      course: 'All courses up to date',
      dueDate: 'N/A',
      priority: 'Low',
      totalPending: 0
    };

    return res.status(200).json({
      success: true,
      todayStudyGoal,
      attendanceAlert,
      upcomingAssignment,
      recommendedSkills: [
        'Agentic AI Engineering (Gemini API & Tool Calling)',
        'Full-Stack TypeScript & React Architecture',
        'Database Optimization & Cloud Deployment'
      ],
      aiGeneratedTips: [
        'Use the 50/10 Pomodoro technique: 50 mins of deep focus followed by a 10 min walking break.',
        'Review slide decks within 24 hours of a lecture to boost long-term memory retention by 60%.',
        'Ask the Career Agent to scan your resume ATS score before applying for upcoming hackathons!'
      ]
    });
  } catch (error) {
    console.error('[AI Controller] getSuggestions Error:', error);
    next(error);
  }
};

/**
 * GET /api/ai/plans - Retrieve saved study plans for the user
 */
const getStudyPlans = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(200).json({ success: true, plans: [] });
    }

    const [rows] = await db.execute(
      'SELECT id, title, plan_type, content, status, created_at FROM study_plans WHERE user_id = ? ORDER BY id DESC LIMIT 10',
      [userId]
    );

    return res.status(200).json({
      success: true,
      plans: rows
    });
  } catch (error) {
    console.error('[AI Controller] getStudyPlans Error:', error);
    next(error);
  }
};

const listModels = async (req, res, next) => {
  try {
    const models = await geminiService.getAvailableModels();
    return res.status(200).json({ success: true, models });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getSuggestions,
  getStudyPlans,
  listModels
};
