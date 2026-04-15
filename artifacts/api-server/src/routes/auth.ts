import { Router, type IRouter } from "express";
import { JoinRoomBody, JoinRoomResponse } from "@workspace/api-zod";
import * as store from "../lib/store";
import { createUserToken, upsertUser, ensureUserInChannel } from "../lib/streamchat";

const router: IRouter = Router();

router.post("/auth/join", async (req, res): Promise<void> => {
  const parsed = JoinRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, role, roomId } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const userId = `${slug}-${Date.now()}`;

  // Upsert user in Stream Chat
  await upsertUser(userId, name, role);

  // Always ensure this user is in the room's Stream channel.
  // ensureUserInChannel creates the channel if it doesn't exist yet,
  // or adds the user if the channel already exists. Safe to call for any role.
  await ensureUserInChannel(roomId, userId, name);

  const streamToken = createUserToken(userId);

  const user = store.createUser({
    userId,
    userName: name,
    role: role as "client" | "freelancer",
    roomId,
  });

  store.addParticipant(roomId, user);

  res.json(
    JoinRoomResponse.parse({
      userId,
      userName: name,
      role,
      streamToken,
      roomId,
    }),
  );
});

export default router;
