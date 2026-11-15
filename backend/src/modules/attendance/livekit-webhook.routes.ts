import { Router } from "express";
import { WebhookReceiver } from "livekit-server-sdk";
import { db } from "../../db.js";
import { config } from "../../config.js";

export const livekitWebhookRouter = Router();
const receiver = new WebhookReceiver(config.LIVEKIT_API_KEY, config.LIVEKIT_API_SECRET);

livekitWebhookRouter.post("/", async (req, res) => {
  if (typeof req.body !== "string") {
    res.status(400).json({ error: "Expected raw webhook body" });
    return;
  }
  const authorization = req.header("authorization");
  if (!authorization) {
    res.status(401).json({ error: "Missing webhook authorization" });
    return;
  }

  let event;
  try {
    event = await receiver.receive(req.body, authorization);
  } catch {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  if (!event.id || !event.event) {
    res.status(400).json({ error: "Webhook event is missing its id or type" });
    return;
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: { id: event.id, eventType: event.event, payload: JSON.parse(req.body) },
      });

      const roomName = event.room?.name;
      const identity = event.participant?.identity;
      if (!roomName) return;
      const session = await tx.classSession.findFirst({
        where: { roomName, status: "ACTIVE" },
        select: { id: true },
      });
      if (!session) return;

      if (event.event === "participant_joined" && identity) {
        const user = await tx.user.findUnique({ where: { id: identity }, select: { id: true } });
        if (!user) return;
        const activeInterval = await tx.attendanceInterval.findFirst({
          where: { sessionId: session.id, userId: identity, leftAt: null },
        });
        if (!activeInterval) {
          await tx.attendanceInterval.create({ data: { sessionId: session.id, userId: identity } });
        }
      } else if (event.event === "participant_left" && identity) {
        const active = await tx.attendanceInterval.findFirst({
          where: { sessionId: session.id, userId: identity, leftAt: null },
          orderBy: { joinedAt: "desc" },
        });
        if (active) {
          await tx.attendanceInterval.update({ where: { id: active.id }, data: { leftAt: new Date() } });
        }
      }
    });
    res.status(200).json({ received: true });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }
    throw error;
  }
});

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
