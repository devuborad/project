const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiCareerService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generates a conversational markdown response for a career query.
   * Maintains conversation context if history is provided.
   * @param {string} userMessage 
   * @param {Array} history - Previous conversation history for context.
   * @returns {Promise<string>}
   */
  async getCareerAdvice(userMessage, history = [], imagePart = null) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.7, // A bit higher for conversational variety
        },
        systemInstruction: `You are an expert Senior Career Mentor, AI Engineer, Full Stack Developer, and Prompt Engineer coaching college students.
Respond using beautiful Markdown formatting. 
When analyzing a student's profile or skills, systematically cover these topics when relevant:
- Career Analysis
- Skill Gap Analysis
- Salary Estimate
- Job Roles
- Learning Path
- Next Technologies
- Project Ideas
- GitHub Improvements
- LinkedIn Improvements
- Resume Advice
- Interview Tips
- Placement Timeline
- Company Suggestions
- Internship Suggestions
- Certifications
- Soft Skill Recommendations

Do not overwhelm the user if they ask a very specific short question, but ensure your answers are highly informative, structured with headers, bullet points, and code blocks where applicable.`
      });

      // Format history for Gemini
      const formattedHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.message }]
      }));

      const chat = model.startChat({
        history: formattedHistory
      });

      const requestPayload = imagePart ? [userMessage, imagePart] : userMessage;
      const result = await chat.sendMessage(requestPayload);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('[GeminiCareerService] Error:', error);
      throw new Error('Failed to generate career advice via Gemini API.');
    }
  }
}

module.exports = new GeminiCareerService();
