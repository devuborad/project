const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static folder for temporary uploads if needed
app.use('/uploads', express.static('uploads'));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CampusAI API' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/ai.routes');
const studentRoutes = require('./routes/studentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const clubRoutes = require('./routes/clubRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const userRoutes = require('./routes/userRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const resumeRoutes = require('./routes/resume.routes');
const roadmapRoutes = require('./routes/roadmap.routes');
const careerRoutes = require('./routes/career.routes');
const searchRoutes = require('./routes/search.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const studyAgentRoutes = require('./routes/studyAgent.routes');
const automationRoutes = require('./routes/automation.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { createRateLimiter, detectPromptInjection, sanitizePrompt } = require('./middleware/security.middleware');
const automationScheduler = require('./services/automationScheduler.service');

// Health check & System Diagnostics Endpoint (for Docker & Hackathon Judges)
const getSystemHealth = () => ({
  status: 'UP',
  service: 'Campus AI Autonomous Platform Backend',
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.floor(process.uptime()),
  memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  platformVersion: '2.0.0-production',
  autonomousScheduler: 'ACTIVE',
  activeAgents: ['StudyAgent', 'AttendanceAgent', 'CareerCoach', 'CampusAssistant', 'AutomationScheduler']
});

app.get('/health', (req, res) => res.json(getSystemHealth()));
app.get('/api/health', (req, res) => res.json(getSystemHealth()));

// Security middleware: Prompt Injection Defense for Autonomous AI Agents
const promptInjectionDefense = (req, res, next) => {
  const prompt = req.body?.prompt || req.body?.message || req.body?.query;
  if (typeof prompt === 'string') {
    const detection = detectPromptInjection(prompt);
    if (detection.isInjection) {
      return res.status(403).json({
        error: 'Security Alert: Prompt Injection or Safety Policy Violation detected.',
        reason: detection.reason,
        agentBlocked: true
      });
    }
    if (req.body.prompt) req.body.prompt = sanitizePrompt(req.body.prompt);
    if (req.body.message) req.body.message = sanitizePrompt(req.body.message);
    if (req.body.query) req.body.query = sanitizePrompt(req.body.query);
  }
  next();
};

// Apply security rate limiter to all API endpoints
app.use('/api', createRateLimiter({ maxRequests: 300, windowMs: 60 * 1000 }));

app.use('/api/auth', authRoutes);
app.use('/api/ai', promptInjectionDefense, aiRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/study-agent', promptInjectionDefense, studyAgentRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start the Autonomous AI Agent Platform Scheduler
  automationScheduler.start();
});
