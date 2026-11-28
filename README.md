# ClassroomLite

A responsive classroom platform foundation with a React + TypeScript frontend and a separate Express + TypeScript API scaffold. The frontend uses local mock data and mock authentication. PostgreSQL is available through Docker Compose, but the API is not yet connected to it; production authentication and real-time/video infrastructure are not included.

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop with Docker Compose

## Database

Set `POSTGRES_PASSWORD` in the root `.env` file, then start PostgreSQL:

```powershell
docker compose up -d postgres
docker compose ps
```

The schema initializer creates users (with a student or teacher role), courses, course enrollments, class sessions, and attendance records. PostgreSQL stores the data in the `postgres_data` named volume. The initializer runs automatically only when PostgreSQL first initializes an empty data volume.

If the database volume was already initialized before the schema was added, apply the initializer once manually:

```powershell
docker compose exec postgres psql -U classroomlite -d classroomlite -f /docker-entrypoint-initdb.d/001_schema.sql
```

If `POSTGRES_USER` or `POSTGRES_DB` is set to a non-default value in `.env`, use that value in the command instead. `docker compose down` preserves the database volume; `docker compose down -v` removes it and its data.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`). The landing page links to demo registration/login. Use the role selector in the app header to preview either experience; demo account data is stored locally in the browser.

Build the frontend with `npm run build`.

## Backend scaffold

In another terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

The API listens on `http://localhost:4000` by default. `GET /health` returns the service status. API route placeholders are mounted under `/api/v1` and respond with `501 Not Implemented` until backend logic is added.

Build and run the compiled server with `npm run build` and `npm start`.

## Project layout

- `frontend/` — Vite app, reusable UI, page routes, mock services, and shared TypeScript types.
- `backend/` — Express server, environment configuration, versioned placeholder routes, and error middleware.

The frontend service layer is intentionally isolated so its in-memory mock implementations can later be replaced with API calls.
