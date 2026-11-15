import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { config } from "./config.js";
import { db } from "./db.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { classroomRouter } from "./modules/classrooms/classrooms.routes.js";
import { sessionRouter } from "./modules/sessions/sessions.routes.js";
import { livekitWebhookRouter } from "./modules/attendance/livekit-webhook.routes.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { attachChatGateway } from "./modules/chat/chat.gateway.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
app.use("/api/v1/webhooks/livekit", express.text({ type: ["application/webhook+json", "application/json"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/health/live", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  await db.$queryRaw`SELECT 1`;
  res.status(200).json({ status: "ready" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/classrooms", classroomRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/webhooks/livekit", livekitWebhookRouter);
app.use(notFound);
app.use(errorHandler);

export function attachSocketServer(server: import("node:http").Server): Server {
  const io = new Server(server, { cors: { origin: config.CLIENT_ORIGIN, credentials: true } });
  attachChatGateway(io);
  return io;
}
