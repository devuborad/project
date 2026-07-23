const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiSearchService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generates a conversational summary for a search query based on raw DB context.
   * @param {string} query 
   * @param {Array} rawRows - Array of DB objects
   * @returns {Promise<string>}
   */
  async generateSearchSummary(query, rawRows) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.3,
        },
        systemInstruction: `You are the CampusAI Smart Search Assistant.
Your job is to read a user's search query and the exact database rows retrieved.
Write a concise, natural language summary answering the user's question based strictly on the provided rows.
Do not make up data. If rows are empty, state that there are no results matching their query.`
      });

      const prompt = `User Search Query: "${query}"\n\nDatabase Results:\n${JSON.stringify(rawRows, null, 2)}`;
      const result = await model.generateContent(prompt);
      return (await result.response).text();
      
    } catch (error) {
      console.error('[GeminiSearchService] Error:', error);
      return "Found some results for your query."; // Graceful fallback
    }
  }
}

module.exports = new GeminiSearchService();
