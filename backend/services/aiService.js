const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

const generateChatResponse = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate response from AI');
  }
};

const summarizeNotes = async (text) => {
  const prompt = `Summarize the following notes clearly and concisely, highlighting the main points:\n\n${text}`;
  return await generateChatResponse(prompt);
};

const reviewResume = async (resumeText) => {
  const prompt = `Act as an expert ATS (Applicant Tracking System) and Senior Technical Recruiter. Review the following resume text. Provide an ATS score out of 100, and actionable feedback for improvement.\n\n${resumeText}`;
  return await generateChatResponse(prompt);
};

module.exports = {
  generateChatResponse,
  summarizeNotes,
  reviewResume,
};
