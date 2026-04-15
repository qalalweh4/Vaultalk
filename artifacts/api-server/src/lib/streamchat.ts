import { StreamChat } from "stream-chat";
import { logger } from "./logger";

let _client: StreamChat | null = null;

export function isStreamEnabled(): boolean {
  return !!(process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET);
}

export function getStreamClient(): StreamChat | null {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) return null;
  if (!_client) {
    _client = new StreamChat(apiKey, apiSecret);
  }
  return _client;
}

export function createUserToken(userId: string): string | null {
  const client = getStreamClient();
  if (!client) return null;
  return client.createToken(userId);
}

export async function upsertUser(
  userId: string,
  userName: string,
  role: string,
): Promise<void> {
  const client = getStreamClient();
  if (!client) return;
  try {
    await client.upsertUsers([{ id: userId, name: userName, role }]);
  } catch (err) {
    logger.error({ err, userId }, "Failed to upsert Stream user");
  }
}

export async function getOrCreateChannel(
  roomId: string,
  clientId: string,
  freelancerId: string | null,
): Promise<string> {
  const client = getStreamClient();
  if (!client) return `room-${roomId}`;

  try {
    // Ensure the bot user exists
    await client.upsertUsers([
      { id: "vaultalk-bot", name: "Vaultalk AI", role: "user" },
    ]);

    const members = [clientId, "vaultalk-bot"];
    if (freelancerId) members.push(freelancerId);

    const channel = client.channel("messaging", roomId, {
      name: `Vaultalk — Room ${roomId}`,
      members,
      created_by_id: clientId,
    });
    await channel.create();
    return channel.id ?? `room-${roomId}`;
  } catch (err) {
    logger.error({ err, roomId }, "Failed to create Stream channel");
    return `room-${roomId}`;
  }
}

export async function addMemberToChannel(
  roomId: string,
  userId: string,
): Promise<void> {
  const client = getStreamClient();
  if (!client) return;
  try {
    const channel = client.channel("messaging", roomId);
    await channel.addMembers([userId]);
  } catch (err) {
    logger.error({ err, roomId, userId }, "Failed to add member to channel");
  }
}

export async function sendSystemMessage(channelId: string, text: string): Promise<void> {
  const client = getStreamClient();
  if (!client) return;
  try {
    const channel = client.channel("messaging", channelId);
    await channel.sendMessage({ text, user_id: "vaultalk-bot" });
  } catch (err) {
    logger.error({ err, channelId }, "Failed to send system message");
  }
}
