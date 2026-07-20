const aiService = require('../services/aiService');
const db = require('../config/db');

const chat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await aiService.generateChatResponse(prompt);

    // Optionally save to DB
    await db.execute(
      'INSERT INTO ai_chats (user_id, prompt, response) VALUES (?, ?, ?)',
      [req.user.id, prompt, response]
    );

    res.json({ response });
  } catch (error) {
    next(error);
  }
};

const summarizeNotes = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for summarization' });
    }

    const summary = await aiService.summarizeNotes(text);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

const reviewResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const feedback = await aiService.reviewResume(resumeText);
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  summarizeNotes,
  reviewResume
};
