import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { z } from "zod";
import { config } from "../../config.js";
import { db } from "../../db.js";
import { AppError } from "../../errors.js";
import type { AuthUser } from "../../middleware/auth.js";
import { assertSessionAccess } from "../sessions/access.service.js";
import { removeLiveKitParticipant } from "../livekit/livekit.service.js";

type ClientToServerEvents = {
  "session:join": (input: { sessionId: string }, ack?: Ack) => void;
  "chat:send": (input: { sessionId: string; content: string }, ack?: Ack) => void;
  "hand:raise": (input: { sessionId: string }, ack?: Ack) => void;
  "classroom:announce": (input: { sessionId: string; content: string }, ack?: Ack) => void;
  "chat:delete": (input: { sessionId: string; messageId: string }, ack?: Ack) => void;
  "participant:remove": (input: { sessionId: string; userId: string }, ack?: Ack) => void;
};

type ServerToClientEvents = {
  "chat:message": (message: unknown) => void;
  "chat:deleted": (input: { messageId: string }) => void;
  "hand:raised": (input: { user: { id: string; name: string } }) => void;
  "classroom:announcement": (input: { content: string; teacher: string; createdAt: string }) => void;
  "participant:presence": (input: { userId: string; online: boolean }) => void;
  "participant:removed": (input: { userId: string }) => void;
};

type Ack = (response: { ok: true; id?: string } | { ok: false; error: string }) => void;
type ClassroomSocket = Socket<ClientToServerEvents, ServerToClientEvents> & { user: AuthUser };

const sessionInput = z.object({ sessionId: z.string().uuid() });

export function attachChatGateway(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
  io.use((socket, next) => {
    const rawToken: unknown = socket.handshake.auth.token;
    if (typeof rawToken !== "string") {
      next(new Error("Authentication required"));
      return;
    }
    try {
      const payload = jwt.verify(rawToken, config.JWT_SECRET);
      if (typeof payload === "string" || !payload.sub || !isUserRole(payload.role)) {
        throw new Error("Invalid token claims");
      }
      (socket as ClassroomSocket).user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as ClassroomSocket;
    const joined = new Map<string, string>();

    socket.on("session:join", async (payload, ack) => {
      await run(ack, async () => {
        const { sessionId } = sessionInput.parse(payload);
        const session = await assertSessionAccess(sessionId, socket.user);
        if (session.status !== "ACTIVE") throw new AppError(409, "Session is not active");
        await socket.join(room(sessionId));
        joined.set(sessionId, session.roomName);
        socket.to(room(sessionId)).emit("participant:presence", { userId: socket.user.id, online: true });
        return {};
      });
    });

    socket.on("chat:send", async (payload, ack) => {
      await run(ack, async () => {
        const input = z.object({ sessionId: z.string().uuid(), content: z.string().trim().min(1).max(2000) }).parse(payload);
        const session = await assertSessionAccess(input.sessionId, socket.user);
        if (session.status !== "ACTIVE" || !joined.has(input.sessionId)) throw new AppError(409, "Join the active session before chatting");
        const message = await db.chatMessage.create({
          data: { sessionId: input.sessionId, userId: socket.user.id, content: input.content },
          include: { user: { select: { id: true, name: true, role: true } } },
        });
        io.to(room(input.sessionId)).emit("chat:message", message);
        return { id: message.id };
      });
    });

    socket.on("hand:raise", async (payload, ack) => {
      await run(ack, async () => {
        const { sessionId } = sessionInput.parse(payload);
        const session = await assertSessionAccess(sessionId, socket.user);
        if (session.status !== "ACTIVE" || !joined.has(sessionId)) throw new AppError(409, "Join the active session first");
        const user = await db.user.findUniqueOrThrow({ where: { id: socket.user.id }, select: { id: true, name: true } });
        io.to(room(sessionId)).emit("hand:raised", { user });
        return {};
      });
    });

    socket.on("classroom:announce", async (payload, ack) => {
      await run(ack, async () => {
        const input = z.object({ sessionId: z.string().uuid(), content: z.string().trim().min(1).max(1000) }).parse(payload);
        const { sessionId } = input;
        const session = await assertSessionAccess(sessionId, socket.user);
        if (!session.isTeacher) throw new AppError(403, "Only the teacher can make announcements");
        if (session.status !== "ACTIVE" || !joined.has(sessionId)) throw new AppError(409, "Join the active session first");
        const teacher = await db.user.findUniqueOrThrow({ where: { id: socket.user.id }, select: { name: true } });
        io.to(room(sessionId)).emit("classroom:announcement", {
          content: input.content,
          teacher: teacher.name,
          createdAt: new Date().toISOString(),
        });
        return {};
      });
    });

    socket.on("chat:delete", async (payload, ack) => {
      await run(ack, async () => {
        const input = z.object({ sessionId: z.string().uuid(), messageId: z.string().uuid() }).parse(payload);
        const session = await assertSessionAccess(input.sessionId, socket.user);
        if (!session.isTeacher) throw new AppError(403, "Only the teacher can moderate chat");
        const result = await db.chatMessage.updateMany({
          where: { id: input.messageId, sessionId: input.sessionId, deletedAt: null },
          data: { deletedAt: new Date() },
        });
        if (!result.count) throw new AppError(404, "Chat message not found");
        io.to(room(input.sessionId)).emit("chat:deleted", { messageId: input.messageId });
        return {};
      });
    });

    socket.on("participant:remove", async (payload, ack) => {
      await run(ack, async () => {
        const input = z.object({ sessionId: z.string().uuid(), userId: z.string().uuid() }).parse(payload);
        const session = await assertSessionAccess(input.sessionId, socket.user);
        if (!session.isTeacher) throw new AppError(403, "Only the teacher can remove participants");
        if (input.userId === socket.user.id) throw new AppError(400, "The teacher cannot remove themselves");
        const enrollment = await db.enrollment.findUnique({
          where: { classroomId_userId: { classroomId: session.classroomId, userId: input.userId } },
        });
        if (!enrollment) throw new AppError(404, "Student is not enrolled in this classroom");
        await removeLiveKitParticipant(session.roomName, input.userId);
        await db.enrollment.delete({ where: { id: enrollment.id } });
        io.to(room(input.sessionId)).emit("participant:removed", { userId: input.userId });
        for (const candidate of await io.in(room(input.sessionId)).fetchSockets()) {
          if ((candidate as unknown as ClassroomSocket).user?.id === input.userId) {
            candidate.disconnect(true);
          }
        }
        return {};
      });
    });

    socket.on("disconnect", () => {
      for (const sessionId of joined.keys()) {
        socket.to(room(sessionId)).emit("participant:presence", { userId: socket.user.id, online: false });
      }
    });
  });
}

function room(sessionId: string): string {
  return `session:${sessionId}`;
}

function isUserRole(role: unknown): role is UserRole {
  return role === UserRole.TEACHER || role === UserRole.STUDENT;
}

async function run(ack: Ack | undefined, action: () => Promise<{ id?: string }>): Promise<void> {
  try {
    const result = await action();
    ack?.({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) ack?.({ ok: false, error: "Invalid request" });
    else if (error instanceof AppError) ack?.({ ok: false, error: error.message });
    else {
      console.error(error);
      ack?.({ ok: false, error: "Request failed" });
    }
  }
}
