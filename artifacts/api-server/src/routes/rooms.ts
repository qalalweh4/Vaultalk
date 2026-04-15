import { Router, type IRouter } from "express";
import { CreateRoomBody } from "@workspace/api-zod";
import * as store from "../lib/store";
import { getOrCreateChannel, sendSystemMessage, isStreamEnabled } from "../lib/streamchat";

const router: IRouter = Router();

router.post("/rooms/create", async (req, res): Promise<void> => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clientId, freelancerId, roomId } = parsed.data;
  store.getOrCreateRoom(roomId);

  const channelId = await getOrCreateChannel(roomId, clientId, freelancerId ?? null);

  if (isStreamEnabled()) {
    await sendSystemMessage(
      roomId,
      "🤝 Vaultalk negotiation room opened. The AI Witness is now active — it will extract contract terms as you negotiate.",
    );
  }

  res.json({ roomId, channelId, streamEnabled: isStreamEnabled() });
});

router.get("/rooms/:roomId", async (req, res): Promise<void> => {
  const raw = req.params.roomId;
  const roomId = Array.isArray(raw) ? raw[0] : raw;

  const room = store.getOrCreateRoom(roomId);
  const escrow = store.getEscrow(roomId);

  res.json({
    roomId,
    participants: room.participants,
    escrow: escrow ?? { status: "empty" },
    streamEnabled: isStreamEnabled(),
  });
});

export default router;
