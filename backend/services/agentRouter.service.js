const db = require('../config/db');
const geminiService = require('./gemini.service');
const studyAgent = require('./studyAgent.service');
const attendanceAgent = require('./attendanceAgent.service');
const assignmentAgent = require('./assignmentAgent.service');
const careerAgent = require('./careerAgent.service');
const campusAssistant = require('./campusAssistant.service');
const aiMemory = require('./aiMemory.service');
const ragService = require('./rag.service');
const multiAgentCollaboration = require('./multiAgentCollaboration.service');

class AgentRouterService {
  constructor() {
    // Scalable Agent Registry (no hardcoded if-else cascades)
    this.agentRegistry = {
      multi_agent_collaboration: {
        name: 'Multi-Agent Team',
        service: multiAgentCollaboration,
        handler: async (prompt, userId, history, opts) => multiAgentCollaboration.collaborateAndAnswer(prompt, userId, history, opts),
        keywords: []
      },
      attendance_agent: {
        name: 'Attendance Agent',
        service: attendanceAgent,
        handler: async (prompt, userId, history) => attendanceAgent.handleQuery(prompt, userId, history),
        keywords: [
          'attendance', 'attend', 'absent', 'present', 'skip', 'miss', 'missing', 
          'lecture', 'class', 'classes', 'percentage', '75%', 'debar', 'debarred', 'tomorrow'
        ]
      },
      assignment_agent: {
        name: 'Assignment Agent',
        service: assignmentAgent,
        handler: async (prompt, userId, history) => assignmentAgent.handleQuery(prompt, userId, history),
        keywords: [
          'assignment', 'assignments', 'pending', 'due', 'deadline', 'deadlines', 
          'submit', 'submission', 'homework', 'finish assignment', 'due this week', 'task queue'
        ]
      },
      career_agent: {
        name: 'Career Agent',
        service: careerAgent,
        handler: async (prompt, userId, history) => careerAgent.handleQuery(prompt, userId, history),
        keywords: [
          'hackathon', 'hackathons', 'resume', 'cv', 'ats', 'internship', 'internships', 
          'skill', 'skills', 'learn', 'project', 'projects', 'career', 'job', 'portfolio', 'company'
        ]
      },
      campus_assistant: {
        name: 'Campus Assistant',
        service: campusAssistant,
        handler: async (prompt, userId, history) => campusAssistant.handleQuery(prompt, userId, history),
        keywords: [
          'hours to study', 'hour to study', 'exam tomorrow', 'exam prep', 'emergency plan', 
          'study plan', 'timetable', 'time-boxed', 'study goal', 'manage time', 'only 2 hours', 'only 1 hour'
        ]
      },
      study_agent: {
        name: 'Study Agent',
        service: studyAgent,
        handler: async (prompt, userId, history, opts) => {
          // Use RAG Knowledge Base first if available
          const ragResult = await ragService.answerWithRAG(userId, prompt, history, opts);
          if (ragResult.usedRag) {
            return {
              success: true,
              agent: 'Study Agent',
              intent: 'rag_knowledge_base',
              confidence: 0.98,
              response: ragResult.answer,
              sources: ragResult.sources,
              data: ragResult
            };
          }

          const result = await studyAgent.answerStudyQuestion(
            prompt, 
            userId, 
            history, 
            opts?.contextNoteId
          );
          return {
            success: true,
            agent: 'Study Agent',
            intent: 'study_qa',
            confidence: 0.95,
            response: result.answer,
            data: result
          };
        },
        keywords: [
          'explain', 'what is', 'summarize', 'notes', 'binary tree', 'algorithm', 
          'stack', 'queue', 'database', 'dbms', 'os', 'operating system', 'code', 
          'difference between', 'define', 'concept', 'question', 'quiz', 'mcq', 'flashcard'
        ]
      }
    };
  }

  /**
   * Semantic scoring to detect which agent should handle the prompt.
   */
  detectIntentAndAgent(text) {
    if (!text) return { agentKey: 'study_agent', agentName: 'Study Agent', confidence: 0.85, intent: 'general' };

    // Check Multi-Agent Collaborative intent first (e.g., "exam tomorrow", "study roadmap")
    if (multiAgentCollaboration.isCollaborativePrompt(text)) {
      return {
        agentKey: 'multi_agent_collaboration',
        agentName: 'Multi-Agent Team',
        confidence: 0.99,
        intent: 'multi_agent_collaboration'
      };
    }

    const lower = text.toLowerCase();
    const scores = {
      attendance_agent: 0,
      assignment_agent: 0,
      career_agent: 0,
      campus_assistant: 0,
      study_agent: 0
    };

    for (const [key, config] of Object.entries(this.agentRegistry)) {
      if (key === 'multi_agent_collaboration') continue;
      for (const kw of config.keywords) {
        if (lower.includes(kw)) {
          scores[key] += (kw.length > 5 ? 3 : 1);
        }
      }
    }

    if (/skip|attendance|absent|present|75%|debar/i.test(text)) {
      scores.attendance_agent += 10;
    }
    if (/pending assignment|assignments due|due this week|help me finish assignment/i.test(text)) {
      scores.assignment_agent += 10;
    }
    if (/recommend hackathon|recommend ai hackathon|improve my resume|skills should i learn|suggest internship|suggest project/i.test(text)) {
      scores.career_agent += 10;
    }
    if (/only \d+ hour|exam tomorrow|have exam|time to study|personalized study plan/i.test(text)) {
      scores.campus_assistant += 10;
    }
    if (/summarize my notes|explain binary|explain os|difference between/i.test(text)) {
      scores.study_agent += 10;
    }

    let bestKey = 'study_agent';
    let maxScore = 0;

    for (const [key, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestKey = key;
      }
    }

    const confidence = maxScore > 0 ? Math.min(0.99, 0.82 + maxScore * 0.02) : 0.85;

    return {
      agentKey: bestKey,
      agentName: this.agentRegistry[bestKey].name,
      confidence: Number(confidence.toFixed(2)),
      intent: bestKey
    };
  }

  /**
   * Asynchronously logs routing decision and execution to agent_logs table
   */
  async logAgentExecution(userId, agentName, intent, prompt, responseText, confidence, status, executionTimeMs) {
    try {
      await db.execute(
        `INSERT INTO agent_logs (user_id, agent_name, intent_detected, prompt, response, confidence, status, execution_time_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId || null, agentName, intent, prompt, responseText || '', confidence, status, executionTimeMs]
      );
    } catch (error) {
      console.error('[AgentRouter] Error writing to agent_logs:', error.message);
    }
  }

  /**
   * Main Router entrypoint: detects intent, calls correct agent, handles fallbacks
   * Features automatic retry with exponential backoff (Part 13) and Long-Term Memory
   */
  async routeAndExecute(prompt, userId, history = [], options = {}) {
    const startTime = Date.now();
    const { agentKey, agentName, confidence, intent } = this.detectIntentAndAgent(prompt);
    const targetAgent = this.agentRegistry[agentKey];

    console.log(`[AgentRouter] Routing prompt to "${agentName}" (Confidence: ${confidence})`);

    // Automatic retry loop with exponential backoff
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await targetAgent.handler(prompt, userId, history, options);
        const executionTimeMs = Date.now() - startTime;

        this.logAgentExecution(
          userId, 
          agentName, 
          intent, 
          prompt, 
          result.response || result.answer, 
          confidence, 
          'success', 
          executionTimeMs
        );

        // Save to Long-Term Memory
        if (userId) {
          await aiMemory.recordChat(userId, prompt, result.response || result.answer, agentName);
        }

        return {
          success: true,
          agent: agentName,
          intent: intent,
          confidence: confidence,
          response: result.response || result.answer,
          collaborationSteps: result.collaborationSteps || [],
          sources: result.sources || [],
          data: result.data || result,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        if (attempt <= maxRetries) {
          console.warn(`[AgentRouter] Attempt ${attempt} failed for agent "${agentName}", retrying in ${attempt * 500}ms...`, error.message);
          await new Promise(r => setTimeout(r, attempt * 500));
          continue;
        }

        // Automatic error fallback to Gemini Service (NEVER CRASH)
        console.warn(`[AgentRouter] Agent "${agentName}" failed after retries. Automatically falling back to Gemini Service:`, error.message);

        let fallbackText = '';
        try {
          const memContext = await aiMemory.buildMemoryContext(userId);
          const enrichedPrompt = memContext ? `${memContext}\n\nStudent prompt: "${prompt}"` : prompt;
          fallbackText = await geminiService.generateChatResponse(enrichedPrompt, null, history, options.imagePart);
        } catch (geminiError) {
          fallbackText = `I apologize, but I experienced a temporary system issue while consulting the ${agentName}. How else can I assist you with your Campus AI tasks today?`;
        }

        const executionTimeMs = Date.now() - startTime;

        this.logAgentExecution(
          userId, 
          agentName, 
          intent, 
          prompt, 
          fallbackText, 
          0.70, 
          'fallback', 
          executionTimeMs
        );

        return {
          success: true,
          agent: 'Study Agent', // Friendly fallback attribution
          intent: 'general_fallback',
          confidence: 0.75,
          response: fallbackText,
          collaborationSteps: [],
          sources: [],
          data: null,
          timestamp: new Date().toISOString()
        };
      }
    }
  }
}

module.exports = new AgentRouterService();
