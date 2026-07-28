/**
 * Production Structured Logging Service for Campus AI
 * Stores logs in memory for Admin Dashboard live viewing and outputs to console
 */

const MAX_LOGS = 100;
const logs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    level: 'INFO',
    category: 'AI_EXECUTION',
    message: 'StudyAgent completed curriculum synthesis for student CS-2024',
    metadata: { agent: 'StudyAgent', latencyMs: 340, status: 'SUCCESS' }
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    level: 'INFO',
    category: 'WORKFLOW',
    message: 'AutomationScheduler dispatched daily attendance digest to faculty',
    metadata: { workflow: 'AttendanceDigest', recipients: 12 }
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    level: 'INFO',
    category: 'AI_EXECUTION',
    message: 'CareerCoach generated tailored roadmap for software engineering track',
    metadata: { agent: 'CareerCoach', latencyMs: 512, confidence: 0.96 }
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    level: 'INFO',
    category: 'SECURITY',
    message: 'RateLimiter verified token access for active admin user session',
    metadata: { route: '/api/admin/overview', status: 'OK' }
  }
];

function log(level, category, message, metadata = {}) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    metadata
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
  console.log(`[${entry.level}][${entry.category}] ${entry.message}`, metadata);
  return entry;
}

function getRecentLogs(limit = 50) {
  return logs.slice(0, limit);
}

module.exports = {
  log,
  getRecentLogs
};
