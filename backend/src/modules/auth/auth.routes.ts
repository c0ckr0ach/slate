import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { z } from "zod";
import { db } from "../../db.js";
import { AppError } from "../../errors.js";
import { authenticate, signAccessToken } from "../../middleware/auth.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
});

authRouter.post("/register", async (req, res) => {
  const input = credentialsSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const user = await db.user.create({
      data: {
        email: input.email,
        name: input.name ?? input.email.split("@")[0]!,
        passwordHash,
        role: input.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.status(201).json({ user, token: signAccessToken(user) });
  } catch (error) {
    if (isUniqueViolation(error)) throw new AppError(409, "An account with this email already exists");
    throw error;
  }
});

authRouter.post("/login", async (req, res) => {
  const input = credentialsSchema.pick({ email: true, password: true }).parse(req.body);
  const user = await db.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    token: signAccessToken(user),
  });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError(404, "User not found");
  res.json({ user });
});

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
