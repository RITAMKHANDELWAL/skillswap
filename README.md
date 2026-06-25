# SkillSwap

SkillSwap is an enterprise-grade, AI-powered peer-to-peer learning ecosystem. It enables students and mentors to exchange skills, generate customized AI learning roadmaps, take verified skill quizzes, schedule mentorship sessions, manage virtual teaching credits, and interact through a force-directed skill knowledge graph.

## Tech Stack
- **Frontend**: React 19, Vite, Zustand, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB)
- **AI Service**: OpenAI/Anthropic SDK or Rule-based template fallback engine

## Project Setup

### Local Setup
1. Install dependencies from root directory:
   ```bash
   npm run install:all
   ```
2. Start both client and server concurrently in development mode:
   ```bash
   npm run dev
   ```
3. To seed the database with test profiles, credits, badges, and quizzes:
   ```bash
   npm run seed
   ```

### Docker Setup
To spin up the entire cluster (MongoDB, server, client):
```bash
docker-compose up --build
```
