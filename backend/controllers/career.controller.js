const geminiCareerService = require('../services/geminiCareer.service');
const careerService = require('../services/career.service');
const pdfParse = require('pdf-parse');

const chat = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    let finalPrompt = message;
    let imagePart = null;

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          finalPrompt += `\n\n[Attached Resume/PDF Content]:\n${pdfData.text}`;
        } catch (err) {
          console.error('[Career Controller] PDF Parse Error:', err);
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

    // 1. Save user message to DB (log original message)
    await careerService.saveMessage(userId, message, 'user');

    // 2. Retrieve history for context
    const history = await careerService.getHistory(userId);
    
    // We only want to send the last ~10 messages to avoid token limits
    const recentHistory = history.slice(-10);

    // 3. Get AI Response
    const aiResponse = await geminiCareerService.getCareerAdvice(finalPrompt, recentHistory, imagePart);

    // 4. Save AI message to DB
    await careerService.saveMessage(userId, aiResponse, 'ai');

    // 5. Return response
    return res.status(200).json({
      success: true,
      message: aiResponse
    });

  } catch (error) {
    console.error('[Career Controller] Error:', error);
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const history = await careerService.getHistory(userId);
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('[Career Controller] Error fetching history:', error);
    next(error);
  }
};

module.exports = {
  chat,
  getHistory
};
