# CampusAI Backend

The complete production-ready REST API for the CampusAI platform. Built with Node.js, Express, and MySQL.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (using `mysql2/promise`)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **File Uploads:** Multer & Cloudinary
- **AI Integration:** `@google/generative-ai` (Gemini API)
- **Security:** Helmet, CORS, Express Validator

## Folder Structure
```
backend/
├── config/           # Database and Cloudinary configuration
├── controllers/      # Route logic and business operations
├── database/         # MySQL schema scripts
├── middleware/       # JWT Auth, Role Guard, Uploads, Error handling
├── routes/           # API Endpoints
├── services/         # Reusable services (AI Integration)
├── uploads/          # Temporary file storage
├── utils/            # Helper classes and functions
├── server.js         # Entry point
└── package.json      # Dependencies
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development

   # MySQL Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=campus_ai

   # Security
   JWT_SECRET=your_super_secret_jwt_key_here

   # Cloudinary (File Uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Setup**
   Ensure MySQL is running. Execute the schema script to create the tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Run the Server**
   ```bash
   npm run dev    # For development (requires nodemon)
   # or
   node server.js # For production
   ```

## API Endpoints Overview
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **AI:** `POST /api/ai/chat`, `POST /api/ai/resume-review`, `POST /api/ai/summarize-notes`
- **Students:** `GET /api/students`, `GET /api/students/:id`, `PUT /api/students/profile`
- **Notes:** `GET /api/notes`, `POST /api/notes/upload`, `DELETE /api/notes/:id`
- **Internships:** `GET /api/internships`, `POST /api/internships`, `POST /api/internships/apply`
- **Clubs:** `GET /api/clubs`, `POST /api/clubs`, `POST /api/clubs/join`

## Error Handling
All routes are wrapped in `try/catch` and utilize a centralized global error handler middleware (`middleware/errorMiddleware.js`) which formats errors consistently.
