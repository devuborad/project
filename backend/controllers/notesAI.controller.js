const { extractTextFromDocument } = require('../utils/documentExtractor');
const geminiNotesService = require('../services/geminiNotes.service');
const notesAIService = require('../services/notesAI.service');

const summarizeNotes = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Must be authenticated
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No note document provided.' });
    }

    // 1. Extract text
    let documentText = '';
    try {
      documentText = await extractTextFromDocument(file.buffer, file.originalname);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    // 2. Call Gemini for Analysis
    const summaryJson = await geminiNotesService.summarizeNotes(documentText);

    // 3. Save to Database
    try {
      await notesAIService.saveSummary(
        userId,
        file.originalname,
        summaryJson
      );
    } catch (dbError) {
      console.warn('[Notes Controller] Could not save summary to DB:', dbError.message);
    }

    // 4. Return success
    return res.status(200).json({
      success: true,
      summary: summaryJson
    });

  } catch (error) {
    console.error('[Notes Controller] Error:', error);
    next(error);
  }
};

module.exports = {
  summarizeNotes
};
