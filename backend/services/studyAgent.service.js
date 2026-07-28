const { Type } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const db = require('../config/db');
const geminiService = require('./gemini.service');

class StudyAgentService {
  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Helper method to get the active GenerativeAI model from the shared gemini.service.js
   */
  getGenAI() {
    if (!geminiService.genAI) {
      throw new Error('Gemini AI service is not properly configured.');
    }
    return geminiService.genAI;
  }

  /**
   * 1. Answering Study Questions with conversational AI & optional note context.
   * Examples: Explain Binary Trees, Explain OS Scheduling, Difference between Stack and Queue, Explain DBMS normalization.
   */
  async answerStudyQuestion(question, userId, history = [], contextNoteId = null) {
    try {
      let contextText = '';

      if (contextNoteId) {
        const [rows] = await db.execute(
          'SELECT file_name, extracted_text FROM uploaded_notes WHERE id = ? AND user_id = ?',
          [contextNoteId, userId]
        );
        if (rows.length > 0) {
          contextText = `Context from uploaded study document "${rows[0].file_name}":\n${rows[0].extracted_text.slice(0, 8000)}\n\n`;
        }
      }

      const systemInstruction = `You are Campus AI's Study Agent — a dedicated academic tutor and computer science / university mentor.
Your responsibilities:
- Answer student study questions clearly, accurately, and thoroughly.
- Examples of questions you excel at: Explain Binary Trees, Explain OS Scheduling, Difference between Stack and Queue, Explain DBMS normalization.
- Use student-friendly formatting with markdown headings, bullet points, and practical examples/diagrams when appropriate.
- Be encouraging and clear. Avoid unnecessary jargon unless explaining the terminology itself.`;

      const model = this.getGenAI().getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 2048,
        },
        systemInstruction,
      });

      let promptPayload = '';
      if (history.length > 0) {
        promptPayload += 'Previous Conversation:\n' +
          history.map(h => `${h.role}: ${h.text}`).join('\n') + '\n\n';
      }

      if (contextText) {
        promptPayload += `${contextText}Student Question: ${question}`;
      } else {
        promptPayload += `Student Question: ${question}`;
      }

      const result = await model.generateContent(promptPayload);
      const answer = await result.response.text();

      // Save Q&A to database
      let chatId = null;
      try {
        const [insertRes] = await db.execute(
          'INSERT INTO study_agent_chats (user_id, question, answer) VALUES (?, ?, ?)',
          [userId, question, answer]
        );
        chatId = insertRes.insertId;
      } catch (dbErr) {
        console.warn('[StudyAgentService] Could not save chat history to DB:', dbErr.message);
      }

      return {
        id: chatId,
        question,
        answer,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('[StudyAgentService] answerStudyQuestion Error:', error);
      throw new Error('Failed to generate answer from Study Agent AI: ' + error.message);
    }
  }

  /**
   * 2. PDF Upload & Full AI Processing Workflow:
   * Upload PDF -> Extract Text -> Send text to Gemini -> Generate Summary -> Generate Key Points -> 
   * Generate Important Definitions -> Generate Interview Questions -> Generate 10 MCQs -> Generate Flashcards -> 
   * Save everything in MySQL -> Return JSON response
   */
  async processUploadedPDF(fileBuffer, originalName, fileSize, userId) {
    try {
      // Step 1: Extract Text from PDF buffer
      let extractedText = '';
      try {
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } catch (pdfErr) {
        throw new Error('Failed to read PDF document. The file may be corrupted or password-protected.');
      }

      if (!extractedText || extractedText.trim().length < 30) {
        throw new Error('The uploaded PDF appears to be empty or contains scanned images without OCR text.');
      }

      // Step 2: Send text to Gemini with structured schema
      const model = this.getGenAI().getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              definitions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ['term', 'definition']
                }
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ['question', 'answer']
                }
              },
              mcqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING }
                  },
                  required: ['question', 'options', 'correctAnswer']
                }
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ['front', 'back']
                }
              }
            },
            required: [
              'summary',
              'keyPoints',
              'definitions',
              'interviewQuestions',
              'mcqs',
              'flashcards'
            ]
          }
        },
        systemInstruction: `You are Campus AI's Study Agent — an advanced AI Academic Tutor and Document Synthesizer.
Analyze the provided student study notes/document and generate the following exact outputs:
1. Summary Prompt: Create concise student-friendly notes that clearly explain the major concepts.
2. Key Points Prompt: Extract the most important core key points as clear bullet points.
3. Definition Prompt: Extract important definitions and terminology with crisp explanations.
4. Interview Prompt: Generate technical interview questions and comprehensive answers based on the material.
5. Quiz Prompt: Generate exactly 10 multiple-choice questions (MCQs) to test understanding, each with 4 options and the correct answer string matching one of the options.
6. Flashcard Prompt: Generate Question and Answer flashcards (front: question/concept, back: answer/explanation) for rapid revision.`
      });

      // Limit prompt size to prevent token limit overflows on huge PDFs
      const trimmedText = extractedText.slice(0, 35000);
      const prompt = `Please analyze the following academic study notes and generate the complete structured study kit:\n\n--- DOCUMENT START ---\n${trimmedText}\n--- DOCUMENT END ---`;

      const result = await model.generateContent(prompt);
      const rawText = await result.response.text();

      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('[StudyAgentService] JSON Parse error from Gemini:', rawText);
        throw new Error('AI generated invalid JSON structure. Please try generating again.');
      }

      // Validate that mcqs is an array of 10 items
      const mcqs = Array.isArray(parsedData.mcqs) ? parsedData.mcqs.slice(0, 10) : [];
      const flashcards = Array.isArray(parsedData.flashcards) ? parsedData.flashcards : [];
      const definitions = Array.isArray(parsedData.definitions) ? parsedData.definitions : [];
      const interviewQuestions = Array.isArray(parsedData.interviewQuestions) ? parsedData.interviewQuestions : [];
      const keyPoints = Array.isArray(parsedData.keyPoints) ? parsedData.keyPoints : [];
      const summary = parsedData.summary || 'Summary not available.';

      // Step 3: Save everything in MySQL
      const connection = await db.getConnection();
      let noteId;
      try {
        await connection.beginTransaction();

        // 1. uploaded_notes
        const [noteRes] = await connection.execute(
          'INSERT INTO uploaded_notes (user_id, file_name, file_size, extracted_text) VALUES (?, ?, ?, ?)',
          [userId, originalName, fileSize, extractedText]
        );
        noteId = noteRes.insertId;

        // 2. study_summaries
        await connection.execute(
          'INSERT INTO study_summaries (note_id, user_id, summary_text, key_points, definitions, interview_questions) VALUES (?, ?, ?, ?, ?, ?)',
          [
            noteId,
            userId,
            summary,
            JSON.stringify(keyPoints),
            JSON.stringify(definitions),
            JSON.stringify(interviewQuestions)
          ]
        );

        // 3. generated_quizzes
        await connection.execute(
          'INSERT INTO generated_quizzes (note_id, user_id, questions_json) VALUES (?, ?, ?)',
          [noteId, userId, JSON.stringify(mcqs)]
        );

        // 4. flashcards
        await connection.execute(
          'INSERT INTO flashcards (note_id, user_id, cards_json) VALUES (?, ?, ?)',
          [noteId, userId, JSON.stringify(flashcards)]
        );

        await connection.commit();
      } catch (dbErr) {
        await connection.rollback();
        console.error('[StudyAgentService] Database Transaction Error:', dbErr);
        throw new Error('Database failure while saving study notes: ' + dbErr.message);
      } finally {
        connection.release();
      }

      // Step 4: Return JSON response
      return {
        noteId,
        fileName: originalName,
        fileSize,
        extractedText,
        summary,
        keyPoints,
        definitions,
        interviewQuestions,
        mcqs,
        flashcards,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('[StudyAgentService] processUploadedPDF Error:', error);
      throw error;
    }
  }

  /**
   * Retrieves all saved study notes for a student
   */
  async getStudentStudyNotes(userId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          n.id AS noteId,
          n.file_name AS fileName,
          n.file_size AS fileSize,
          n.created_at AS createdAt,
          s.summary_text AS summaryText
        FROM uploaded_notes n
        LEFT JOIN study_summaries s ON n.id = s.note_id
        WHERE n.user_id = ?
        ORDER BY n.id DESC
      `, [userId]);

      return rows;
    } catch (error) {
      console.error('[StudyAgentService] getStudentStudyNotes Error:', error);
      throw new Error('Database failure while fetching study notes.');
    }
  }

  /**
   * Retrieves a specific study note with all its summaries, quizzes, and flashcards
   */
  async getStudyNoteById(noteId, userId) {
    try {
      const [noteRows] = await db.execute(
        'SELECT id, file_name, file_size, created_at FROM uploaded_notes WHERE id = ? AND user_id = ?',
        [noteId, userId]
      );

      if (noteRows.length === 0) {
        throw new Error('Study note not found or access denied.');
      }

      const note = noteRows[0];

      // Fetch summary
      const [summaryRows] = await db.execute(
        'SELECT summary_text, key_points, definitions, interview_questions FROM study_summaries WHERE note_id = ?',
        [noteId]
      );

      // Fetch quiz
      const [quizRows] = await db.execute(
        'SELECT questions_json FROM generated_quizzes WHERE note_id = ?',
        [noteId]
      );

      // Fetch flashcards
      const [flashcardRows] = await db.execute(
        'SELECT cards_json FROM flashcards WHERE note_id = ?',
        [noteId]
      );

      const summaryData = summaryRows[0] || {};
      const quizData = quizRows[0] || {};
      const flashcardData = flashcardRows[0] || {};

      const parseJSONSafe = (val, fallback) => {
        if (!val) return fallback;
        if (typeof val === 'object') return val;
        try {
          return JSON.parse(val);
        } catch (e) {
          return fallback;
        }
      };

      return {
        noteId: note.id,
        fileName: note.file_name,
        fileSize: note.file_size,
        createdAt: note.created_at,
        summary: summaryData.summary_text || '',
        keyPoints: parseJSONSafe(summaryData.key_points, []),
        definitions: parseJSONSafe(summaryData.definitions, []),
        interviewQuestions: parseJSONSafe(summaryData.interview_questions, []),
        mcqs: parseJSONSafe(quizData.questions_json, []),
        flashcards: parseJSONSafe(flashcardData.cards_json, [])
      };
    } catch (error) {
      console.error('[StudyAgentService] getStudyNoteById Error:', error);
      throw error;
    }
  }

  /**
   * Retrieves recent Study Q&A history for a student
   */
  async getStudyChatHistory(userId, limit = 20) {
    try {
      const [rows] = await db.execute(
        'SELECT id, question, answer, created_at FROM study_agent_chats WHERE user_id = ? ORDER BY id DESC LIMIT ?',
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('[StudyAgentService] getStudyChatHistory Error:', error);
      throw new Error('Database failure while fetching study chat history.');
    }
  }
}

module.exports = new StudyAgentService();
