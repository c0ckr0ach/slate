import { Router } from "express";
import { randomBytes } from "node:crypto";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { z } from "zod";
import { db } from "../../db.js";
import { AppError } from "../../errors.js";
import { authenticate, requireRole } from "../../middleware/auth.js";

export const classroomRouter = Router();
classroomRouter.use(authenticate);

classroomRouter.post("/", requireRole(UserRole.TEACHER), async (req, res) => {
  const input = z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1000).optional(),
  }).parse(req.body);
  const classroom = await db.classroom.create({
    data: {
      ...input,
      teacherId: req.user!.id,
      inviteCode: randomBytes(6).toString("base64url").toUpperCase(),
    },
    include: { _count: { select: { enrollments: true } } },
  });
  res.status(201).json({ classroom });
});

classroomRouter.get("/", async (req, res) => {
  const classrooms = req.user!.role === UserRole.TEACHER
    ? await db.classroom.findMany({
        where: { teacherId: req.user!.id },
        include: { _count: { select: { enrollments: true } }, sessions: { where: { status: "ACTIVE" } } },
        orderBy: { createdAt: "desc" },
      })
    : await db.classroom.findMany({
        where: { enrollments: { some: { userId: req.user!.id } } },
        include: {
          teacher: { select: { id: true, name: true } },
          sessions: { where: { status: "ACTIVE" } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
  res.json({ classrooms });
});

classroomRouter.post("/enroll", requireRole(UserRole.STUDENT), async (req, res) => {
  const { inviteCode } = z.object({ inviteCode: z.string().trim().min(1).max(32) }).parse(req.body);
  const classroom = await db.classroom.findUnique({ where: { inviteCode: inviteCode.toUpperCase() } });
  if (!classroom) throw new AppError(404, "Invalid classroom invitation code");
  const enrollment = await db.enrollment.upsert({
    where: { classroomId_userId: { classroomId: classroom.id, userId: req.user!.id } },
    create: { classroomId: classroom.id, userId: req.user!.id },
    update: {},
  });
  res.status(201).json({ enrollment, classroom: { id: classroom.id, title: classroom.title } });
});

classroomRouter.get("/:classroomId/attendance", requireRole(UserRole.TEACHER), async (req, res) => {
  const { classroomId } = z.object({ classroomId: z.string().uuid() }).parse(req.params);
  const classroom = await db.classroom.findFirst({
    where: { id: classroomId, teacherId: req.user!.id },
    select: { id: true },
  });
  if (!classroom) throw new AppError(404, "Classroom not found");
  const attendance = await db.attendanceInterval.findMany({
    where: { session: { classroomId: classroom.id } },
    include: { user: { select: { id: true, name: true, email: true } }, session: { select: { id: true, startedAt: true } } },
    orderBy: { joinedAt: "desc" },
  });
  res.json({ attendance });
});
