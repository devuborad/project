const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

class GeminiRoadmapService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generates a 18-part structured roadmap based on student inputs.
   * @param {Object} studentData
   * @returns {Promise<Object>}
   */
  async generateRoadmap(studentData) {
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
              learningRoadmap: { type: Type.STRING },
              weeklyPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
              monthlyMilestones: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedTechnologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              dsaRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
              developmentRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiMlRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
              devOpsRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
              githubIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              freeResources: { type: Type.ARRAY, items: { type: Type.STRING } },
              youtubeChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
              books: { type: Type.ARRAY, items: { type: Type.STRING } },
              interviewPrepTimeline: { type: Type.ARRAY, items: { type: Type.STRING } },
              placementPrep: { type: Type.ARRAY, items: { type: Type.STRING } },
              resumeImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
              internshipTimeline: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "learningRoadmap", "weeklyPlan", "monthlyMilestones", 
              "recommendedTechnologies", "dsaRoadmap", "developmentRoadmap", 
              "aiMlRoadmap", "devOpsRoadmap", "recommendedProjects", 
              "githubIdeas", "certifications", "freeResources", 
              "youtubeChannels", "books", "interviewPrepTimeline", 
              "placementPrep", "resumeImprovement", "internshipTimeline"
            ]
          }
        },
        systemInstruction: `You are a Senior AI Engineer, Senior Full Stack Developer, Senior Career Mentor, and Architect.
Generate a personalized, production-ready learning roadmap for a student.
Provide all 18 fields. If a field (like aiMlRoadmap or devOpsRoadmap) isn't directly relevant to their goal, provide a basic foundational roadmap for it anyway, as it is required.`
      });

      const prompt = `Generate a roadmap based on these details:
- Year: ${studentData.year}
- Semester: ${studentData.semester}
- Branch: ${studentData.branch}
- Current Skills: ${studentData.skills}
- Languages: ${studentData.languages}
- Frameworks: ${studentData.frameworks}
- CGPA: ${studentData.cgpa}
- Interests: ${studentData.interests}
- Career Goal: ${studentData.careerGoal}
- Duration: ${studentData.duration}
- Hours/Day: ${studentData.hoursPerDay}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
      
    } catch (error) {
      console.error('[GeminiRoadmapService] Generation failed:', error);
      throw new Error('Failed to generate roadmap via Gemini API.');
    }
  }
}

module.exports = new GeminiRoadmapService();
