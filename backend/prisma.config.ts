import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config({ path: resolve(process.cwd(), "../.env") });
dotenv.config();

export default defineConfig({
  schema: "../database/schema.prisma",
  migrations: {
    path: "../database/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
