const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { verifyToken } = require('../middleware/auth');

// POST /api/automation/webhook - Open webhook callback endpoint for external n8n instances
router.post('/webhook', automationController.handleWebhook);

// Protected routes
router.use(verifyToken);

// POST /api/automation/trigger - Manually trigger an autonomous workflow
router.post('/trigger', automationController.triggerWorkflow);

// GET /api/automation/logs - Get workflow audit logs
router.get('/logs', automationController.getWorkflowLogs);

module.exports = router;
