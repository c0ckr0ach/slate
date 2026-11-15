import { Router } from "express";
import { randomUUID } from "node:crypto";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { z } from "zod";
import { db } from "../../db.js";
import { config } from "../../config.js";
import { AppError } from "../../errors.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { assertSessionAccess } from "./access.service.js";
import { createLiveKitRoom, createParticipantToken, endLiveKitRoom } from "../livekit/livekit.service.js";

export const sessionRouter = Router();
sessionRouter.use(authenticate);

sessionRouter.post("/classrooms/:classroomId/sessions", requireRole(UserRole.TEACHER), async (req, res) => {
  const { classroomId } = z.object({ classroomId: z.string().uuid() }).parse(req.params);
  const classroom = await db.classroom.findFirst({ where: { id: classroomId, teacherId: req.user!.id } });
  if (!classroom) throw new AppError(404, "Classroom not found");
  const existing = await db.classSession.findFirst({ where: { classroomId, status: "ACTIVE" } });
  if (existing) throw new AppError(409, "This classroom already has an active session");
  const roomName = `classroom-${classroomId}-${randomUUID()}`;
  const session = await db.classSession.create({ data: { classroomId, roomName } });
  try {
    await createLiveKitRoom(roomName);
  } catch {
    await db.classSession.delete({ where: { id: session.id } });
    throw new AppError(503, "Unable to start the LiveKit room");
  }
  res.status(201).json({ session });
});

sessionRouter.post("/:sessionId/end", requireRole(UserRole.TEACHER), async (req, res) => {
  const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.params);
  const session = await assertSessionAccess(sessionId, req.user!);
  if (!session.isTeacher) throw new AppError(403, "Only the classroom teacher can end this session");
  if (session.status === "ENDED") throw new AppError(409, "Session has already ended");
  await endLiveKitRoom(session.roomName);
  const ended = await db.classSession.update({
    where: { id: session.id },
    data: { status: "ENDED", endedAt: new Date() },
  });
  await db.attendanceInterval.updateMany({
    where: { sessionId: session.id, leftAt: null },
    data: { leftAt: ended.endedAt },
  });
  res.json({ session: ended });
});

sessionRouter.post("/:sessionId/token", async (req, res) => {
  const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.params);
  const session = await assertSessionAccess(sessionId, req.user!);
  if (session.status !== "ACTIVE") throw new AppError(409, "Session is not active");
  const token = await createParticipantToken({
    sessionId: session.id,
    roomName: session.roomName,
    userId: req.user!.id,
    role: req.user!.role,
  });
  res.json({ token, serverUrl: config.LIVEKIT_PUBLIC_URL });
});

sessionRouter.get("/:sessionId/chat", async (req, res) => {
  const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.params);
  const session = await assertSessionAccess(sessionId, req.user!);
  const messages = await db.chatMessage.findMany({
    where: { sessionId: session.id, deletedAt: null },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  res.json({ messages });
});

sessionRouter.get("/:sessionId/attendance", async (req, res) => {
  const { sessionId } = z.object({ sessionId: z.string().uuid() }).parse(req.params);
  const session = await assertSessionAccess(sessionId, req.user!);
  if (!session.isTeacher) throw new AppError(403, "Only the classroom teacher can view attendance");
  const attendance = await db.attendanceInterval.findMany({
    where: { sessionId: session.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });
  res.json({ attendance });
});
