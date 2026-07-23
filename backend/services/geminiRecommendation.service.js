const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

class GeminiRecommendationService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generateRecommendations(studentData) {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY is not configured');

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  opportunity: { type: Type.NUMBER, description: "0-100 score" },
                  career: { type: Type.NUMBER, description: "0-100 score" },
                  readiness: { type: Type.NUMBER, description: "0-100 score" }
                },
                required: ["opportunity", "career", "readiness"]
              },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    message: { type: Type.STRING },
                    severity: { type: Type.STRING, description: "'High', 'Medium', or 'Low'" }
                  },
                  required: ["message", "severity"]
                }
              },
              upcomingDeadlines: { type: Type.ARRAY, items: { type: Type.STRING } },
              learningSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedEvents: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "scores", "insights", "riskAlerts", "upcomingDeadlines", 
              "learningSuggestions", "recommendedEvents"
            ]
          }
        },
        systemInstruction: `You are an expert AI Analytics Engine for CampusAI.
Analyze the provided student data (Profile, Attendance, Assignments, Events).
Calculate 3 scores (0-100): Opportunity, Career, Readiness.
Provide personalized insights (e.g. "Attend 4 more lectures").
Identify risk alerts (e.g. low attendance, missing assignments).
List upcoming deadlines to focus on.
Provide specific learning suggestions and event/hackathon recommendations based on their skills.`
      });

      const prompt = `Student Data:\n${JSON.stringify(studentData, null, 2)}`;
      const result = await model.generateContent(prompt);
      return JSON.parse((await result.response).text());
      
    } catch (error) {
      console.error('[GeminiRecommendationService] Error:', error);
      throw new Error('Failed to generate AI recommendations.');
    }
  }
}

module.exports = new GeminiRecommendationService();
