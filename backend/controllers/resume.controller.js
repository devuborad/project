const { extractTextFromPDF } = require('../utils/pdfExtractor');
const geminiResumeService = require('../services/geminiResume.service');
const resumeService = require('../services/resume.service');

const analyzeResume = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Must be authenticated
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No resume file provided.' });
    }

    // 1. Extract text from the PDF buffer
    let resumeText = '';
    try {
      resumeText = await extractTextFromPDF(file.buffer);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    // 2. Call Gemini for Analysis
    // (This might take a few seconds)
    const analysisJson = await geminiResumeService.analyzeResume(resumeText);

    // 3. Save to Database
    // We are doing in-memory processing, so resumeUrl is null
    try {
      await resumeService.saveReview(
        userId,
        file.originalname,
        null, // resumeUrl
        analysisJson.atsScore,
        analysisJson
      );
    } catch (dbError) {
      // Non-fatal, just log it. We still want to return the analysis to the user.
      console.warn('[Resume Controller] Could not save review to DB:', dbError.message);
    }

    // 4. Return success
    return res.status(200).json({
      success: true,
      analysis: analysisJson
    });

  } catch (error) {
    console.error('[Resume Controller] Error:', error);
    next(error);
  }
};

module.exports = {
  analyzeResume
};
