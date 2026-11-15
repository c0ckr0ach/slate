import { describe, expect, it } from "vitest";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { participantGrants } from "./livekit.service.js";

describe("participantGrants", () => {
  it("allows teachers to publish and subscribe in their session room", () => {
    expect(participantGrants(UserRole.TEACHER, "room-a")).toEqual({
      roomJoin: true,
      room: "room-a",
      canPublish: true,
      canSubscribe: true,
      canPublishData: false,
    });
  });

  it("makes students subscribe-only", () => {
    expect(participantGrants(UserRole.STUDENT, "room-a")).toEqual({
      roomJoin: true,
      room: "room-a",
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
    });
  });
});
