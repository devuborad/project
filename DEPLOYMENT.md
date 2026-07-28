# Campus AI Production Deployment & Hackathon Judge Setup

This guide provides step-by-step instructions for deploying **Campus AI** to a production environment or running it locally for hackathon judging.

---

## 1. Quick Start with Docker (Recommended for Judges)

Campus AI includes full Docker and Docker Compose orchestration for seamless one-command launch:

```bash
# 1. Clone the repository and navigate to root directory
cd d:/campus

# 2. Launch all services (Backend, Frontend, and Database)
docker-compose up --build -d
```

- **Frontend Application**: Access at `http://localhost` (Port 80)
- **Backend API Server**: Access at `http://localhost:5000` (Port 5000)
- **System Health Diagnostics**: Verify at `http://localhost:5000/health`

---

## 2. Hackathon Judge Preview (Demo Mode)

Judges can test 100% of the platform's multi-agent functionality without creating an account or manually entering data:
1. Open the Login page at `/login`.
2. Click the **"🚀 Explore as Hackathon Judge (Demo Mode)"** button.
3. The platform will automatically log you in as a Principal Administrator with pre-seeded attendance, assignments, notes, workflow executions, and AI analytics.

---

## 3. Manual Local Deployment (Node.js & Vite)

If you prefer running without Docker:

### Backend API Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### Frontend Web App (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Health Check Endpoint Verification

To verify that the server, database connection, and autonomous agent scheduler are healthy:
```bash
curl http://localhost:5000/health
```

Expected JSON response:
```json
{
  "status": "UP",
  "service": "Campus AI Autonomous Platform Backend",
  "platformVersion": "2.0.0-production",
  "autonomousScheduler": "ACTIVE",
  "activeAgents": ["StudyAgent", "AttendanceAgent", "CareerCoach", "CampusAssistant", "AutomationScheduler"]
}
```
