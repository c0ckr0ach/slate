import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma-client/index.js";
import { config } from "../config.js";
import { AppError } from "../errors.js";

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, config.JWT_SECRET, {
    subject: user.id,
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub || !isUserRole(payload.role)) {
      throw new Error("Invalid token claims");
    }
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
}

function isUserRole(role: unknown): role is UserRole {
  return role === UserRole.TEACHER || role === UserRole.STUDENT;
}
