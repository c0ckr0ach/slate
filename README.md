# ClassroomLite

A local-first classroom MVP: Express/TypeScript API, PostgreSQL/Prisma, Socket.IO chat, and LiveKit media. The backend authorizes every classroom/session action; browser media connects directly to LiveKit. This is a modular monolith.

## Run locally

1. Copy `.env.example` to `.env` and set `JWT_SECRET` to a random value of at least 32 characters. Keep the LiveKit key/secret private.
2. Start PostgreSQL, LiveKit, and the API: `docker compose up --build`.
3. Seed demo users in another terminal: `cd backend; npm install; npm run db:seed`.
4. Start the optional UI: `cd frontend; npm install; npm run dev`.
5. Open `http://localhost:5173`.

Demo sign-ins: `teacher@classroomlite.local` / `teacher1234` and `student@classroomlite.local` / `student1234`. Invitation code: `DEMO01`. Change these development-only credentials before any shared deployment.

For backend development without Docker, install dependencies in `backend/`, provide the environment variables from `.env.example` (set `LIVEKIT_INTERNAL_URL=http://localhost:7880`), run `npm run db:migrate`, then `npm run dev`. The PostgreSQL URL must point to a running database.

## Local network behavior

LiveKit internal API requests use `LIVEKIT_INTERNAL_URL` (Compose service DNS); token responses carry `LIVEKIT_PUBLIC_URL` for browsers. Compose publishes the signaling TCP port, RTC TCP fallback, and a bounded UDP media range so this works with Docker Desktop, including Windows. On Linux, if the host's NAT/firewall prevents UDP media, you can use host networking for LiveKit and adjust `LIVEKIT_INTERNAL_URL`/`LIVEKIT_PUBLIC_URL` accordingly. PostgreSQL is only reachable on the Compose network.

LiveKit webhooks must be configured to call `http://backend:4000/api/v1/webhooks/livekit` from the LiveKit service/network. The endpoint verifies the signed raw body, records the event id transactionally to deduplicate delivery, and opens/closes attendance intervals.

## API outline

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `POST /api/v1/classrooms`, `GET /api/v1/classrooms`, `POST /api/v1/classrooms/enroll`
- `GET /api/v1/classrooms/:classroomId/attendance`
- `POST /api/v1/sessions/classrooms/:classroomId/sessions`, `POST /api/v1/sessions/:sessionId/end`
- `POST /api/v1/sessions/:sessionId/token`, `GET /api/v1/sessions/:sessionId/chat`, `GET /api/v1/sessions/:sessionId/attendance`
- Socket.IO events: `session:join`, `chat:send`, `hand:raise`, `classroom:announce`, `chat:delete`, `participant:remove`

Registration accepts `role: "TEACHER" | "STUDENT"` to support independent tutors self-onboarding. Student LiveKit tokens cannot publish audio/video or data; teacher grants allow publication. Chat and announcements are persisted or broadcast by the backend, not by LiveKit data channels.

## Development checks

From `backend/`: `npm test`, `npm run build`. The tests cover classroom access and teacher/student LiveKit publishing grants. Use Prisma migrations for schema changes; do not edit production databases manually.
