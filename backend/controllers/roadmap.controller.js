const geminiRoadmapService = require('../services/geminiRoadmap.service');
const roadmapService = require('../services/roadmap.service');

const generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Must be authenticated
    const studentData = req.body;

    if (!studentData || !studentData.careerGoal) {
      return res.status(400).json({ success: false, error: 'Student data and career goal are required.' });
    }

    // 1. Call Gemini for Analysis
    const roadmapJson = await geminiRoadmapService.generateRoadmap(studentData);

    // 2. Save to Database
    try {
      await roadmapService.saveRoadmap(
        userId,
        studentData.careerGoal,
        roadmapJson
      );
    } catch (dbError) {
      console.warn('[Roadmap Controller] Could not save roadmap to DB:', dbError.message);
    }

    // 3. Return success
    return res.status(200).json({
      success: true,
      roadmap: roadmapJson
    });

  } catch (error) {
    console.error('[Roadmap Controller] Error:', error);
    next(error);
  }
};

module.exports = {
  generateRoadmap
};
