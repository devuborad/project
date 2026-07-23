const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

class GeminiResumeService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Analyzes the extracted text from a resume.
   * @param {string} resumeText 
   * @returns {Promise<Object>} Structured JSON response.
   */
  async analyzeResume(resumeText) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent JSON
          responseMimeType: "application/json",
          // The schema guarantees the exact format we need
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              grammar: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              careerPath: { type: Type.STRING },
              interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              priority: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["atsScore", "summary", "strengths", "weaknesses", "missingSkills", "grammar", "projects", "certifications", "careerPath", "interviewTips", "priority"]
          }
        },
        systemInstruction: `You are a Senior ATS Resume Screener and Technical Recruiter. Analyze the provided resume text.
Your goal is to provide a comprehensive, constructive, and accurate evaluation.
Calculate an ATS Score out of 100 based on formatting, keyword optimization, and impact.
Provide all requested fields logically.`
      });

      const prompt = `Analyze this resume and provide the JSON output exactly matching the schema. Resume Text:\n\n${resumeText}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
      
    } catch (error) {
      console.error('[GeminiResumeService] Analysis failed:', error);
      throw new Error('Failed to analyze resume via Gemini API.');
    }
  }
}

module.exports = new GeminiResumeService();
