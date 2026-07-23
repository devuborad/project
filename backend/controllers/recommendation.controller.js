const dataAggregatorService = require('../services/dataAggregator.service');
const geminiRecommendationService = require('../services/geminiRecommendation.service');
const recommendationService = require('../services/recommendation.service');

const generateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // 1. Aggregate Data
    const studentData = await dataAggregatorService.getStudentContext(userId);

    // 2. Generate Recommendations via Gemini
    const recommendations = await geminiRecommendationService.generateRecommendations(studentData);

    // 3. Save to History
    await recommendationService.saveRecommendation(userId, recommendations);

    // 4. Return
    return res.status(200).json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('[Recommendation Controller] Generate error:', error);
    next(error);
  }
};

const getLatestRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const latest = await recommendationService.getLatestRecommendation(userId);
    
    if (latest) {
      return res.status(200).json({ success: true, data: latest });
    } else {
      return res.status(404).json({ success: false, message: 'No recommendations found.' });
    }
  } catch (error) {
    console.error('[Recommendation Controller] Error fetching latest:', error);
    next(error);
  }
};

module.exports = {
  generateRecommendations,
  getLatestRecommendations
};
