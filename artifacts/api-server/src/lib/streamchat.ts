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
  _role: string,
): Promise<void> {
  const client = getStreamClient();
  if (!client) return;
  try {
    // Stream Chat only accepts built-in roles: "user", "admin", "moderator", etc.
    await client.upsertUsers([{ id: userId, name: userName, role: "user" }]);
  } catch (err) {
    logger.error({ err, userId }, "Failed to upsert Stream user");
  }
}

/**
 * Ensures a user is a member of the room's channel.
 * Creates the channel if it doesn't exist yet.
 * Idempotent — safe to call multiple times for any role.
 */
export async function ensureUserInChannel(
  roomId: string,
  userId: string,
  _userName: string,
): Promise<void> {
  const client = getStreamClient();
  if (!client) return;

  try {
    // Ensure bot exists first
    await client.upsertUsers([
      { id: "vaultalk-bot", name: "Vaultalk AI", role: "user" },
    ]);

    // queryChannels returns Channel[] directly (not { channels: [] })
    const existing = await client.queryChannels(
      { type: "messaging", id: { $eq: roomId } },
      {},
      { limit: 1 },
    );

    if (existing.length > 0) {
      // Channel exists — add this user as a member
      await existing[0].addMembers([userId]);
      logger.info({ roomId, userId }, "Added user to existing Stream channel");
    } else {
      // Channel doesn't exist yet — create it with this user
      const channel = client.channel("messaging", roomId, {
        name: `Vaultalk — ${roomId}`,
        members: [userId, "vaultalk-bot"],
        created_by_id: userId,
      });
      await channel.create();
      logger.info({ roomId, userId }, "Created new Stream channel for user");
    }
  } catch (err) {
    logger.error({ err, roomId, userId }, "Failed to ensure user in channel");
  }
}

/**
 * Creates or updates a room's Stream channel.
 * Safe to call multiple times — adds members if channel already exists.
 */
export async function getOrCreateChannel(
  roomId: string,
  clientId: string,
  freelancerId: string | null,
): Promise<string> {
  const client = getStreamClient();
  if (!client) return `room-${roomId}`;

  try {
    await client.upsertUsers([
      { id: "vaultalk-bot", name: "Vaultalk AI", role: "user" },
    ]);

    const existing = await client.queryChannels(
      { type: "messaging", id: { $eq: roomId } },
      {},
      { limit: 1 },
    );

    const membersToAdd = [clientId, "vaultalk-bot"];
    if (freelancerId) membersToAdd.push(freelancerId);

    if (existing.length > 0) {
      await existing[0].addMembers(membersToAdd);
      return existing[0].id ?? roomId;
    }

    const channel = client.channel("messaging", roomId, {
      name: `Vaultalk — ${roomId}`,
      members: membersToAdd,
      created_by_id: clientId,
    });
    await channel.create();
    return channel.id ?? roomId;
  } catch (err) {
    logger.error({ err, roomId }, "Failed to get/create Stream channel");
    return `room-${roomId}`;
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
