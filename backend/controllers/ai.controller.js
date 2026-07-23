const geminiService = require('../services/gemini.service');
const intentService = require('../services/intent.service');
const queryService = require('../services/query.service');
const entityService = require('../services/entity.service');
const contextBuilder = require('../services/contextBuilder.service');
const db = require('../config/db');
const pdfParse = require('pdf-parse');

/**
 * Helper to fetch recent chat history for a user
 */
async function getChatHistory(userId, limit = 4) {
  if (!userId) return [];
  try {
    const [rows] = await db.execute(
      'SELECT prompt, response FROM ai_chats WHERE user_id = ? ORDER BY id DESC LIMIT ?',
      [userId, limit]
    );
    // Reverse to get chronological order
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
 * Handles the AI chat endpoint logic with full Intent & Entity pipeline.
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
    const history = await getChatHistory(userId, 4);

    // 2. Detect Intent & Extract Entities
    const startIntent = Date.now();
    const { intent, confidence, entities } = await intentService.detectIntent(finalPrompt, history);
    const intentTime = Date.now() - startIntent;

    console.log(`[AI Controller] Intent: ${intent} | Conf: ${confidence} | Entities:`, entities);

    // 3. Confidence Check
    if (confidence < 0.70 && intent !== 'general') {
      return res.status(200).json({
        success: true,
        intent: 'clarification',
        response: `I'm not entirely sure if you mean ${intent}. Could you clarify what you're looking for?`,
        source: 'system'
      });
    }

    // 4. Execute Business Logic (Database Queries)
    let context = null;
    let rawData = null;
    let queryTime = 0;
    let source = 'gemini';

    if (intent !== 'general') {
      source = 'database';
      const sanitizedEntities = entityService.sanitizeEntities(entities);
      
      const startQuery = Date.now();
      rawData = await queryService.executeQuery(intent, userId, sanitizedEntities);
      queryTime = Date.now() - startQuery;

      // 5. Build Context
      context = contextBuilder.buildContext(intent, sanitizedEntities, rawData);
    }

    // 6. Call Gemini
    const startGemini = Date.now();
    const responseText = await geminiService.generateChatResponse(finalPrompt, context, history, imagePart);
    const geminiTime = Date.now() - startGemini;

    // 7. Log Conversation Memory & Metrics
    if (userId) {
       try {
         await db.execute(
           'INSERT INTO ai_chats (user_id, prompt, response) VALUES (?, ?, ?)',
           [userId, prompt, responseText] // We log the original prompt, not the giant pdf text
         );
       } catch (dbError) {
         console.error('[AI Controller] Database Logging Error:', dbError.message);
       }
    }

    console.log(`[AI Performance] Intent: ${intentTime}ms | DB: ${queryTime}ms | Gemini: ${geminiTime}ms`);

    // 8. Return Structured Response
    return res.status(200).json({ 
      success: true,
      intent,
      data: rawData,
      response: responseText,
      source 
    });

  } catch (error) {
    console.error('[AI Controller] Chat Error:', error);
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
  listModels
};
