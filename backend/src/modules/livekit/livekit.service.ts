import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { UserRole } from "../../../generated/prisma-client/index.js";
import { config } from "../../config.js";

const rooms = new RoomServiceClient(
  config.LIVEKIT_INTERNAL_URL,
  config.LIVEKIT_API_KEY,
  config.LIVEKIT_API_SECRET,
);

export async function createParticipantToken(input: {
  sessionId: string;
  roomName: string;
  userId: string;
  role: UserRole;
}): Promise<string> {
  const token = new AccessToken(config.LIVEKIT_API_KEY, config.LIVEKIT_API_SECRET, {
    identity: input.userId,
    ttl: config.LIVEKIT_TOKEN_TTL_SECONDS,
    metadata: JSON.stringify({ sessionId: input.sessionId, role: input.role }),
  });
  token.addGrant(participantGrants(input.role, input.roomName));
  return token.toJwt();
}

export function participantGrants(role: UserRole, roomName: string) {
  return {
    roomJoin: true,
    room: roomName,
    canPublish: role === UserRole.TEACHER,
    canSubscribe: true,
    canPublishData: false,
  };
}

export async function createLiveKitRoom(roomName: string): Promise<void> {
  await rooms.createRoom({
    name: roomName,
    emptyTimeout: 300,
    maxParticipants: 41,
  });
}

export async function endLiveKitRoom(roomName: string): Promise<void> {
  await rooms.deleteRoom(roomName);
}

export async function removeLiveKitParticipant(roomName: string, identity: string): Promise<void> {
  await rooms.removeParticipant(roomName, identity);
}
