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

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
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

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
