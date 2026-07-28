const studyAgentService = require('../services/studyAgent.service');
const agentRouter = require('../services/agentRouter.service');

/**
 * Handle student PDF upload and full AI processing workflow
 * Routes: POST /api/study-agent/upload
 */
const uploadPDF = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please select a PDF document to upload. No file was received.' 
      });
    }

    // Check file type: PDF only
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file format. Only PDF files are accepted.' 
      });
    }

    // Check file size: Max 20 MB
    const maxSizeBytes = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSizeBytes) {
      return res.status(400).json({ 
        success: false, 
        error: 'The uploaded PDF is too large. Maximum permitted size is 20 MB.' 
      });
    }

    // Check empty PDF
    if (file.size === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'The uploaded PDF is empty (0 bytes).' 
      });
    }

    console.log(`[StudyAgentController] Processing PDF upload "${file.originalname}" (${file.size} bytes) for user ${userId}...`);

    const result = await studyAgentService.processUploadedPDF(
      file.buffer,
      file.originalname,
      file.size,
      userId
    );

    // Autonomous Platform Hook: Index in RAG Vector Knowledge Base and trigger automated study kit notifications
    const automationScheduler = require('../services/automationScheduler.service');
    automationScheduler.onNewPdfUploaded(
      result.noteId, 
      userId, 
      result.extractedText || result.summary || 'PDF document notes', 
      file.originalname
    ).catch(err => console.error('[StudyAgentController] Autonomous PDF hook error:', err.message));

    return res.status(200).json({
      success: true,
      message: 'PDF successfully processed by Study Agent.',
      data: result
    });
  } catch (error) {
    console.error('[StudyAgentController] uploadPDF Error:', error);

    let userErrorMessage = error.message || 'An unexpected error occurred while processing the PDF.';
    
    // Provide user-friendly categorized errors
    if (userErrorMessage.includes('corrupted') || userErrorMessage.includes('password-protected')) {
      userErrorMessage = 'The uploaded PDF file is corrupted or password-protected. Please upload a readable PDF.';
    } else if (userErrorMessage.includes('scanned images') || userErrorMessage.includes('empty')) {
      userErrorMessage = 'Could not extract readable text from the PDF. Ensure it contains selectable text, not just scanned images.';
    } else if (userErrorMessage.includes('Gemini') || userErrorMessage.includes('AI generated invalid JSON')) {
      userErrorMessage = 'Gemini AI service temporarily failed to synthesize the notes. Please click Generate Again.';
    } else if (userErrorMessage.includes('Database failure')) {
      userErrorMessage = 'Database failure while saving your study notes. Please try again.';
    } else if (userErrorMessage.includes('fetch') || userErrorMessage.includes('network') || userErrorMessage.includes('ECONNREFUSED')) {
      userErrorMessage = 'Internet or network connection error while communicating with Gemini AI service.';
    }

    return res.status(500).json({
      success: false,
      error: userErrorMessage
    });
  }
};

/**
 * Handle conversational Study Q&A
 * Route: POST /api/study-agent/question
 */
const askQuestion = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { question, history, contextNoteId } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid study question.' 
      });
    }

    const result = await agentRouter.routeAndExecute(
      question.trim(),
      userId,
      Array.isArray(history) ? history : [],
      { contextNoteId: contextNoteId || null }
    );

    return res.status(200).json({
      success: true,
      agent: result.agent,
      intent: result.intent,
      confidence: result.confidence,
      data: {
        id: Date.now(),
        question: question.trim(),
        answer: result.response,
        agent: result.agent,
        confidence: result.confidence,
        intent: result.intent
      }
    });
  } catch (error) {
    console.error('[StudyAgentController] askQuestion Error:', error);
    let errorMsg = error.message || 'Failed to get answer from Study Agent.';
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      errorMsg = 'Internet connection error while reaching Gemini AI.';
    }
    return res.status(500).json({
      success: false,
      error: errorMsg
    });
  }
};

/**
 * Get list of student's past uploaded study notes
 * Route: GET /api/study-agent/notes
 */
const getNotes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const notes = await studyAgentService.getStudentStudyNotes(userId);
    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('[StudyAgentController] getNotes Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database failure while fetching study notes.'
    });
  }
};

/**
 * Get specific study note with all generated summaries, quizzes, flashcards, definitions
 * Route: GET /api/study-agent/notes/:id
 */
const getNoteById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const noteId = parseInt(req.params.id, 10);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (isNaN(noteId)) {
      return res.status(400).json({ success: false, error: 'Invalid study note ID.' });
    }

    const noteData = await studyAgentService.getStudyNoteById(noteId, userId);
    return res.status(200).json({
      success: true,
      data: noteData
    });
  } catch (error) {
    console.error('[StudyAgentController] getNoteById Error:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      error: error.message || 'Failed to fetch study note.'
    });
  }
};

/**
 * Get recent Study Q&A history
 * Route: GET /api/study-agent/history
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const history = await studyAgentService.getStudyChatHistory(userId, 30);
    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('[StudyAgentController] getHistory Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database failure while fetching study chat history.'
    });
  }
};

module.exports = {
  uploadPDF,
  askQuestion,
  getNotes,
  getNoteById,
  getHistory
};
