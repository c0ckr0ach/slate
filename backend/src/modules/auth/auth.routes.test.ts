import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import supertest from "supertest";

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  findUser: vi.fn(),
}));
vi.mock("../../db.js", () => ({
  db: {
    user: {
      create: mocks.createUser,
      findUnique: mocks.findUser,
    },
  },
}));

import { app } from "../../app.js";

describe("authentication routes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers an account and returns an access token without its password hash", async () => {
    mocks.createUser.mockImplementation(async ({ data }) => ({
      id: "c35c480a-4518-4d3e-80ee-4b99ebafceea",
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    }));

    const response = await supertest(app).post("/api/v1/auth/register").send({
      name: "Riley Tutor",
      email: "RILEY@example.com",
      password: "classroom-password",
      role: "TEACHER",
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("riley@example.com");
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.token).toEqual(expect.any(String));
    expect(mocks.createUser).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ email: "riley@example.com", role: "TEACHER" }),
    }));
  });

  it("rejects invalid credentials on login", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 4);
    mocks.findUser.mockResolvedValue({
      id: "c35c480a-4518-4d3e-80ee-4b99ebafceea",
      name: "Riley Tutor",
      email: "riley@example.com",
      role: "TEACHER",
      passwordHash,
    });

    const response = await supertest(app).post("/api/v1/auth/login").send({
      email: "riley@example.com",
      password: "incorrect-password",
    });
    expect(response.status).toBe(401);
  });
});
