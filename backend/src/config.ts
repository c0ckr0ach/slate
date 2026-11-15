import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(process.cwd(), "../.env") });
dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  LIVEKIT_API_KEY: z.string().min(1),
  LIVEKIT_API_SECRET: z.string().min(1),
  LIVEKIT_INTERNAL_URL: z.string().url(),
  LIVEKIT_PUBLIC_URL: z.string().url(),
  LIVEKIT_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).max(86400).default(3600),
});

export const config = configSchema.parse(process.env);
