const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

class IntentService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async detectIntent(prompt, history = []) {
    if (!this.apiKey) return { intent: 'general', confidence: 1, entities: {} };

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { 
                type: Type.STRING, 
                description: "Must be exactly one of: attendance, assignments, events, clubs, notes, internships, scholarships, notifications, complaints, profile, timetable, general" 
              },
              confidence: { 
                type: Type.NUMBER, 
                description: "A number between 0.0 and 1.0 representing how confident you are in this intent classification." 
              },
              entities: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  semester: { type: Type.STRING },
                  branch: { type: Type.STRING },
                  date: { type: Type.STRING },
                  company: { type: Type.STRING },
                  club_name: { type: Type.STRING },
                  faculty_name: { type: Type.STRING },
                  technology: { type: Type.STRING }
                }
              }
            },
            required: ["intent", "confidence", "entities"]
          }
        },
        systemInstruction: `You are the Intent Detection Engine for CampusAI.
Your job is to read the user's prompt (and previous chat history if provided for context like "Who uploaded them?") and classify it into exactly one of these 12 intents:
1. attendance (e.g. "My attendance", "Show attendance")
2. assignments (e.g. "Pending assignments", "Assignments due")
3. events (e.g. "Upcoming events", "Hackathons")
4. clubs (e.g. "Available clubs", "AI Club")
5. notes (e.g. "React Notes", "Semester 3 DSA")
6. internships (e.g. "Frontend Internship", "Remote Internship")
7. scholarships
8. notifications
9. complaints
10. profile
11. timetable
12. general (e.g. coding questions, casual chat, everything else without a specific database need)

Extract any mentioned entities like subject, semester, company, etc. If none, return empty strings.`
      });

      let historyText = history.length > 0 ? "Previous Context:\n" + history.map(h => `${h.role}: ${h.text}`).join("\n") + "\n\n" : "";
      const fullPrompt = `${historyText}User Prompt: "${prompt}"`;
      
      const result = await model.generateContent(fullPrompt);
      const jsonStr = (await result.response).text();
      const parsed = JSON.parse(jsonStr);
      
      console.log(`[IntentService] Detected: ${parsed.intent} (Confidence: ${parsed.confidence})`);
      return parsed;

    } catch (error) {
      console.error('[IntentService] Classification failed:', error.message);
      return { intent: 'general', confidence: 1, entities: {} };
    }
  }
}

module.exports = new IntentService();
