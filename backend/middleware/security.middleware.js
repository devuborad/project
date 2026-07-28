/**
 * Security Middleware for Autonomous AI Agent Platform
 * Enforces Rate Limiting, File Validation (20MB max), Input Sanitization, and Security Audit Logging
 */

// Simple high-performance in-memory Rate Limiter
const rateLimitStore = new Map();

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 60; // 60 req per minute default
  const message = options.message || 'Too many requests, please try again later.';

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const key = req.user?.id || req.ip || 'global';
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      console.warn(`[Security] Rate limit exceeded for key: ${key}`);
      return res.status(429).json({ error: message, rateLimited: true });
    }

    next();
  };
}

/**
 * Validates uploaded PDF/Document files:
 * - Checks file size (Max 20MB limit)
 * - Checks file mime type
 */
function validatePdfSizeAndType(req, res, next) {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : null);
  if (!file) return next();

  const maxSizeBytes = 20 * 1024 * 1024; // 20 MB limit
  if (file.size > maxSizeBytes) {
    return res.status(400).json({
      error: `File size exceeds 20MB limit. Uploaded file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`
    });
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.mimetype) && !file.originalname.toLowerCase().endsWith('.pdf')) {
    return res.status(400).json({
      error: 'Invalid file format. Only PDF, DOC, DOCX, and TXT files are allowed.'
    });
  }

  next();
}

/**
 * Sanitizes input string to prevent script injection / excessive payload
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .trim();
}

/**
 * Sanitizes input prompt for AI agents to prevent malicious control characters or HTML injection
 */
function sanitizePrompt(prompt) {
  if (typeof prompt !== 'string') return prompt;
  return prompt
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim();
}

/**
 * Detects common prompt injection attacks against autonomous AI agents
 */
function detectPromptInjection(prompt) {
  if (typeof prompt !== 'string') return { isInjection: false };
  const lower = prompt.toLowerCase();
  const injectionPatterns = [
    /ignore (?:all )?previous instructions/i,
    /you are now dan/i,
    /system prompt override/i,
    /print your system prompt/i,
    /reveal your instructions/i,
    /bypass safety guidelines/i,
    /do anything now/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return {
        isInjection: true,
        reason: `Potential Prompt Injection Pattern detected: ${pattern.toString()}`
      };
    }
  }

  return { isInjection: false };
}

/**
 * Audit log helper
 */
function logSecurityEvent(req, eventType, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    eventType,
    details
  };
  console.log(`[SecurityLog] ${logEntry.eventType} by User ${logEntry.userId}`, logEntry.details);
}

module.exports = {
  createRateLimiter,
  validatePdfSizeAndType,
  sanitizeInput,
  sanitizePrompt,
  detectPromptInjection,
  logSecurityEvent
};
