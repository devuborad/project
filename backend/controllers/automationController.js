/**
 * Automation & n8n Webhook Controller (Part 3 & 4)
 * Handles triggering workflows, reading logs, and listening for n8n webhook callbacks.
 */

const n8nService = require('../services/n8n.service');
const db = require('../config/db');

/**
 * Trigger an autonomous workflow manually or programmatically
 */
exports.triggerWorkflow = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || 1;
    const { workflowName, customData } = req.body;

    if (!workflowName) {
      return res.status(400).json({ error: 'workflowName is required' });
    }

    const result = await n8nService.triggerWorkflow(workflowName, userId, 'manual_api', customData || {});
    return res.status(200).json({
      success: true,
      message: `Workflow "${workflowName}" executed successfully`,
      data: result
    });
  } catch (error) {
    console.error('[AutomationController] triggerWorkflow error:', error);
    return res.status(500).json({ error: 'Failed to trigger workflow' });
  }
};

/**
 * Get workflow execution logs
 */
exports.getWorkflowLogs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    let query = `SELECT * FROM workflow_logs ORDER BY created_at DESC LIMIT 50`;
    let params = [];

    if (!isAdmin && userId) {
      query = `SELECT * FROM workflow_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;
      params = [userId];
    }

    const [rows] = await db.execute(query, params);
    return res.status(200).json({
      success: true,
      count: rows.length,
      logs: rows
    });
  } catch (error) {
    console.error('[AutomationController] getWorkflowLogs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve workflow logs' });
  }
};

/**
 * Webhook callback receiver for incoming n8n automations
 */
exports.handleWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('[AutomationController] Received external n8n webhook callback:', payload);

    if (payload.userId && payload.workflowName) {
      await n8nService.logWorkflow(
        payload.workflowName,
        'n8n_webhook_incoming',
        payload.userId,
        payload.status || 'success',
        payload
      );
    }

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('[AutomationController] handleWebhook error:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
};
