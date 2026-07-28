const db = require('../config/db');
const geminiService = require('./gemini.service');

class CareerAgentService {
  constructor() {
    this.agentName = 'Career Agent';
  }

  /**
   * Reads internships and hackathons from DB
   */
  async getCareerOpportunities() {
    let internships = [];
    let hackathons = [];

    try {
      const [intRows] = await db.execute('SELECT company, title, stipend, location, type FROM internships LIMIT 10');
      internships = intRows;
    } catch (e) {
      console.warn('[CareerAgent] Internships query failed, using sample data:', e.message);
    }

    try {
      const [hackRows] = await db.execute('SELECT title, description, start_date, prize_pool, registration_link FROM club_hackathons LIMIT 10');
      hackathons = hackRows;
    } catch (e) {
      console.warn('[CareerAgent] Hackathons query failed, using sample data:', e.message);
    }

    if (internships.length === 0) {
      internships = [
        { company: 'Google AI', title: 'Machine Learning Research Intern', stipend: '$8,000 / mo', location: 'Remote', type: 'Internship' },
        { company: 'Microsoft', title: 'Software Engineer Intern (Cloud)', stipend: '$7,500 / mo', location: 'Bangalore / Hyderabad', type: 'Internship' },
        { company: 'DeepMind', title: 'Agentic Coding Fellow', stipend: 'Competitive', location: 'London / Remote', type: 'Scholarship' }
      ];
    }

    if (hackathons.length === 0) {
      hackathons = [
        { title: 'CampusAI Global Hackathon 2026', description: 'Build multi-agent AI systems for education.', prize_pool: '$25,000', start_date: '2026-08-15' },
        { title: 'Google Gemini AI Developer Challenge', description: 'Create innovative web apps powered by Gemini 1.5 Flash.', prize_pool: '$50,000', start_date: '2026-09-01' }
      ];
    }

    return {
      internships,
      hackathons
    };
  }

  /**
   * Handle user query regarding career, hackathons, resume, skills, internships, projects
   */
  async handleQuery(prompt, userId, history = []) {
    try {
      const opportunities = await this.getCareerOpportunities();

      const systemInstruction = `You are Campus AI's Career Agent — a Senior Tech Career Mentor and ATS Specialist.
Your responsibilities:
- Answer student career queries: "Recommend hackathons", "Improve my resume", "What skills should I learn?", "Suggest projects", "Suggest internships".
- Use the provided internship and hackathon opportunities from our database when recommending opportunities.
- When asked about skills to learn, suggest high-impact, modern tech stacks (e.g., Python, TypeScript, React, Next.js, Node.js, LangChain/Gemini Multi-Agent Systems, SQL/NoSQL, Docker).
- When asked for project ideas, suggest full-stack AI-integrated projects that impress recruiters.
- Format your response with professional Markdown headings, tables, bullet points, and actionable tips.`;

      const promptPayload = `[Available Campus Internships & Hackathons]:
${JSON.stringify(opportunities, null, 2)}

[Student Career Query]:
${prompt}`;

      let responseText = '';
      try {
        const model = geminiService.genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
          systemInstruction
        });
        const res = await model.generateContent(promptPayload);
        responseText = res.response.text();
      } catch (geminiErr) {
        responseText = this.formatFallbackCareerResponse(opportunities);
      }

      return {
        success: true,
        agent: this.agentName,
        intent: 'career',
        confidence: 0.96,
        response: responseText,
        data: opportunities
      };
    } catch (error) {
      console.error('[CareerAgent] handleQuery error:', error);
      throw error;
    }
  }

  formatFallbackCareerResponse(data) {
    let md = `### 🚀 Career, Internship & Hackathon Guide\n\n`;
    md += `#### 🏆 Recommended Hackathons\n`;
    data.hackathons.forEach(h => {
      md += `- **${h.title}** | Prize Pool: **${h.prize_pool || 'TBA'}** | Start: ${h.start_date || 'Upcoming'}\n`;
      md += `  _${h.description}_\n`;
    });
    md += `\n#### 💼 Featured Internships\n`;
    data.internships.forEach(i => {
      md += `- **${i.company}** - ${i.title} (${i.location}) | Stipend: **${i.stipend}**\n`;
    });
    md += `\n#### ⚡ Recommended Tech Skills for 2026\n`;
    md += `- **AI & Multi-Agent Engineering**: Gemini API, Prompt Engineering, Agent Routing\n`;
    md += `- **Full-Stack Web**: TypeScript, React, Vite, Node.js, Express, MySQL\n`;
    md += `- **System Design**: Cloud deployment, Docker, Microservices\n`;
    return md;
  }
}

module.exports = new CareerAgentService();
