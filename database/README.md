# Database

The canonical Prisma schema and migrations live under `database/`. The backend's `prisma.config.ts` points to this shared database module. Run `npm run db:migrate` from `backend/` during development and `npm run db:deploy` for deployments.
