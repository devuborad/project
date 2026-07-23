const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY is not configured in environment variables.');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey || 'unconfigured');
    this.primaryModelName = null;

    this.generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 1000,
    };

    this.systemInstruction = `You are CampusAI, an AI assistant built for college students.

Your responsibilities:
- Help students with academics.
- Explain programming concepts.
- Help with assignments.
- Suggest hackathons and internships.
- Guide students in career planning.
- Answer questions about campus clubs, events, and college life.
- Be friendly, concise, and practical.
- If the user asks something unrelated to student life, answer normally but steer the conversation back when appropriate.`;
  }

  /**
   * Fetches the available models from the Gemini API using native fetch.
   * Useful for debugging and dynamically finding supported models.
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json();
      const models = data.models || [];
      
      console.log('\n--- Available Gemini Models ---');
      models.forEach(model => {
        console.log(`- Model: ${model.name} | Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      });
      console.log('-------------------------------\n');
      
      return models;
    } catch (error) {
      console.error('[GeminiService] Error fetching models:', error);
      throw error;
    }
  }

  /**
   * Dynamically resolves the best model based on supported generation methods.
   */
  async getModel() {
    if (this.primaryModelName) {
      return this.genAI.getGenerativeModel({ 
        model: this.primaryModelName,
        generationConfig: this.generationConfig
      });
    }

    const models = await this.getAvailableModels();
    
    const priorityOrder = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash'
    ];

    const isDeprecated = (name) => {
      return name.includes('gemini-2.5-flash') || 
             name.includes('gemini-2.5-pro') || 
             name.includes('gemini-1.5');
    };

    const isPreviewOrMedia = (name) => {
      return name.includes('preview') || name.includes('vision') || name.includes('audio');
    };

    let validModel = null;

    // 1. Try to find a model from our priority list
    for (const priorityName of priorityOrder) {
      const found = models.find(m => {
        const name = m.name.replace('models/', '');
        return name === priorityName && 
               m.supportedGenerationMethods && 
               m.supportedGenerationMethods.includes('generateContent') &&
               !isDeprecated(name) &&
               !isPreviewOrMedia(name);
      });
      
      if (found) {
        validModel = found;
        break;
      }
    }

    // 2. Fallback to any valid model if none in priority order exist
    if (!validModel) {
      validModel = models.find(m => {
        const name = m.name.replace('models/', '');
        return m.supportedGenerationMethods && 
               m.supportedGenerationMethods.includes('generateContent') &&
               name.includes('gemini') &&
               !isDeprecated(name) &&
               !isPreviewOrMedia(name);
      });
    }

    if (!validModel) {
      throw new Error('No compatible Gemini models found for generateContent');
    }

    // The API returns models in format 'models/gemini-1.5-flash', we only need the base name
    this.primaryModelName = validModel.name.replace('models/', '');
    console.log(`[GeminiService] Dynamically selected primary model: ${this.primaryModelName}`);

    return this.genAI.getGenerativeModel({ 
      model: this.primaryModelName,
      generationConfig: this.generationConfig,
      systemInstruction: this.systemInstruction
    });
  }

  /**
   * Generates a response for a given chat prompt.
   * @param {string} prompt - The user's input prompt.
   * @param {string|null} context - Optional database context.
   * @returns {Promise<string>} The AI's response text.
   */
  async generateChatResponse(prompt, context = null, history = [], imagePart = null) {
    try {
      const model = await this.getModel();
      
      let finalPrompt = "";
      if (history.length > 0) {
        finalPrompt += "Previous Conversation:\n" + history.map(h => `${h.role}: ${h.text}`).join("\n") + "\n\n";
      }

      if (context) {
        finalPrompt += `Below is relevant database context or file context for the user's query. Use this context to inform your answer.\n\n<Context>\n${context}\n</Context>\n\nUser Question: ${prompt}`;
      } else {
        finalPrompt += `User Question: ${prompt}`;
      }

      const requestPayload = imagePart ? [finalPrompt, imagePart] : finalPrompt;
      const result = await model.generateContent(requestPayload);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`[GeminiService] Model generation failed. Error:`, error.message);
      throw new Error('Failed to generate response from Gemini API.');
    }
  }
}

// Export as a singleton
module.exports = new GeminiService();
