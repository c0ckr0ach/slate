import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../../../generated/prisma-client/index.js";

const mocks = vi.hoisted(() => ({
  findSession: vi.fn(),
  findEnrollment: vi.fn(),
}));
vi.mock("../../db.js", () => ({
  db: {
    classSession: { findUnique: mocks.findSession },
    enrollment: { findUnique: mocks.findEnrollment },
  },
}));

import { assertSessionAccess } from "./access.service.js";

describe("assertSessionAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows the classroom teacher without an enrollment", async () => {
    mocks.findSession.mockResolvedValue({
      id: "session-id",
      classroomId: "class-id",
      classroom: { teacherId: "teacher-id" },
    });
    const result = await assertSessionAccess("session-id", { id: "teacher-id", role: UserRole.TEACHER });
    expect(result.isTeacher).toBe(true);
    expect(mocks.findEnrollment).not.toHaveBeenCalled();
  });

  it("rejects a student who is not enrolled", async () => {
    mocks.findSession.mockResolvedValue({
      id: "session-id",
      classroomId: "class-id",
      classroom: { teacherId: "teacher-id" },
    });
    mocks.findEnrollment.mockResolvedValue(null);
    await expect(
      assertSessionAccess("session-id", { id: "student-id", role: UserRole.STUDENT }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
