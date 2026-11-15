import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "../generated/prisma-client/index.js";

const db = new PrismaClient();

async function main(): Promise<void> {
  const teacherPassword = await bcrypt.hash("teacher1234", 12);
  const studentPassword = await bcrypt.hash("student1234", 12);
  const teacher = await db.user.upsert({
    where: { email: "teacher@classroomlite.local" },
    update: {},
    create: {
      name: "Demo Teacher",
      email: "teacher@classroomlite.local",
      passwordHash: teacherPassword,
      role: UserRole.TEACHER,
    },
  });
  const student = await db.user.upsert({
    where: { email: "student@classroomlite.local" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@classroomlite.local",
      passwordHash: studentPassword,
      role: UserRole.STUDENT,
    },
  });
  const classroom = await db.classroom.upsert({
    where: { inviteCode: "DEMO01" },
    update: {},
    create: {
      title: "Demo classroom",
      description: "A classroom for trying the local MVP.",
      inviteCode: "DEMO01",
      teacherId: teacher.id,
    },
  });
  await db.enrollment.upsert({
    where: { classroomId_userId: { classroomId: classroom.id, userId: student.id } },
    update: {},
    create: { classroomId: classroom.id, userId: student.id },
  });
  console.log("Seeded teacher@classroomlite.local and student@classroomlite.local (passwords: teacher1234 / student1234)");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
