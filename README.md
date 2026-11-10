# Meal Planner

A smart meal planning application developed as my undergraduate thesis at Algebra Bernays University (Applied Computer Science – Software Engineering).

The project has three parts: a REST API backend, a web client and a mobile app.

## Tech Stack

| Part | Technologies |
|------|--------------|
| **Backend** | Java 21, Spring Boot, Spring Data JPA, PostgreSQL 17, JWT authentication, Gradle |
| **AI integration** | OpenAI-compatible API (Groq) |
| **Web** | React, TypeScript, Vite, Axios |
| **Mobile** | React Native, Expo, TypeScript |
| **DevOps** | Docker, Docker Compose |

## Project Structure

```
mealplanner/
├── backend/   # Spring Boot REST API + Dockerfile + docker-compose.yml
├── web/       # React + Vite web client
└── mobile/    # React Native (Expo) mobile app
```

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) on your phone (for the mobile app)

### 1. Backend (Docker)

```bash
cd backend
cp .env.example .env
```

Fill in the values in `.env`:

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | PostgreSQL password (any value for local use) |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `OPENAI_API_KEY` | API key for the AI provider (Groq) |

Start the database and the API:

```bash
docker compose up --build
```

- API: http://localhost:8081/api
- PostgreSQL: `localhost:5433`

### 2. Web

```bash
cd web
npm install
npm run dev
```

Open the URL printed in the terminal (by default http://localhost:5173).

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go.

> **Note:** In `mobile/src/api/client.ts`, set `API_BASE` to your computer's local IP address (e.g. `http://192.168.x.x:8081/api`) so your phone can reach the backend.

## Author

**Ivan Petar Šolić**
