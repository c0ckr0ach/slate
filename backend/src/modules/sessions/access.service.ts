import { UserRole } from "../../../generated/prisma-client/index.js";
import { db } from "../../db.js";
import { AppError } from "../../errors.js";
import type { AuthUser } from "../../middleware/auth.js";

export async function assertSessionAccess(sessionId: string, user: AuthUser) {
  const session = await db.classSession.findUnique({
    where: { id: sessionId },
    include: { classroom: { select: { teacherId: true } } },
  });
  if (!session) throw new AppError(404, "Session not found");
  const isTeacher = session.classroom.teacherId === user.id && user.role === UserRole.TEACHER;
  const enrollment = user.role === UserRole.STUDENT
    ? await db.enrollment.findUnique({
        where: { classroomId_userId: { classroomId: session.classroomId, userId: user.id } },
        select: { id: true },
      })
    : null;
  if (!isTeacher && !enrollment) throw new AppError(403, "You are not enrolled in this classroom");
  return { ...session, isTeacher };
}
