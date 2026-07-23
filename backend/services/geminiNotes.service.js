const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

class GeminiNotesService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generates a 12-part structured notes summary.
   * @param {string} text 
   * @returns {Promise<Object>}
   */
  async summarizeNotes(text) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              importantTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              definitions: { 
                type: Type.ARRAY, 
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                }
              },
              formulaSheet: { type: Type.ARRAY, items: { type: Type.STRING } },
              flashcards: {
                type: Type.ARRAY, 
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              },
              quizQuestions: {
                type: Type.ARRAY, 
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ["question", "answer"]
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
                  required: ["question", "answer"]
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
                  required: ["question", "options", "correctAnswer"]
                }
              },
              difficultyLevel: { type: Type.STRING },
              estimatedReadingTime: { type: Type.STRING },
              suggestedRevisionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "summary", "importantTopics", "keyPoints", "definitions", 
              "formulaSheet", "flashcards", "quizQuestions", "interviewQuestions", 
              "mcqs", "difficultyLevel", "estimatedReadingTime", "suggestedRevisionPlan"
            ]
          }
        },
        systemInstruction: `You are an expert AI Tutor and Notes Summarizer. 
Extract educational content from the provided notes text. Provide exactly 12 sections formatted strictly according to the requested JSON schema.
If a section (e.g. formulas) does not apply to the subject, provide a generic tip or empty array rather than omitting it.`
      });

      const prompt = `Please summarize and analyze these notes:\n\n${text.substring(0, 50000)}`; // Trim to avoid token limits just in case
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
      
    } catch (error) {
      console.error('[GeminiNotesService] Summarization failed:', error);
      throw new Error('Failed to generate summary via Gemini API.');
    }
  }
}

module.exports = new GeminiNotesService();
