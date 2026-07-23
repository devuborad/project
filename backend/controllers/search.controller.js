const intentService = require('../services/intent.service');
const contextBuilder = require('../services/context.builder');
const geminiSearchService = require('../services/geminiSearch.service');
const searchService = require('../services/search.service');

const search = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter q is required.' });
    }

    // 1. Detect Intent
    const intent = await intentService.detectIntent(q);

    // 2. Fetch Raw Database Context (Array of Objects)
    const rawResults = await contextBuilder.getRawContext(intent, userId);

    // 3. Generate Natural Language Answer via Gemini
    let answer = 'No matching information found.';
    if (intent !== 'general') {
      answer = await geminiSearchService.generateSearchSummary(q, rawResults);
    } else {
      // For general chat without DB context, just use the context builder or standard gemini fallback
      answer = await geminiSearchService.generateSearchSummary(q, [{ message: 'No specific campus data needed for general query.' }]);
    }

    // 4. Save to Search History
    if (userId) {
      await searchService.saveHistory(userId, q);
    }

    return res.status(200).json({
      success: true,
      intent,
      answer,
      results: rawResults
    });

  } catch (error) {
    console.error('[Search Controller] Search error:', error);
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const recent = await searchService.getRecentSearches(userId);
    return res.status(200).json({ success: true, history: recent });
  } catch (error) {
    console.error('[Search Controller] Error fetching history:', error);
    next(error);
  }
};

module.exports = {
  search,
  getHistory
};
