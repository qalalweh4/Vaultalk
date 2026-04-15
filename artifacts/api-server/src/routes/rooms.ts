import { Router, type IRouter } from "express";
import { CreateRoomBody } from "@workspace/api-zod";
import * as store from "../lib/store";
import { getOrCreateChannel, sendSystemMessage, isStreamEnabled, ensureUserInChannel, upsertUser } from "../lib/streamchat";

const router: IRouter = Router();

// ── New: buyer requests a room with a specific seller ──────────────────────

router.post("/rooms/request", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const buyer = token ? store.getAccountByToken(token) : null;

  if (!buyer || buyer.role !== "buyer") {
    res.status(401).json({ error: "Must be logged in as a buyer" });
    return;
  }

  const { sellerUsername, description, amount, currency } = req.body ?? {};
  if (!sellerUsername) {
    res.status(400).json({ error: "sellerUsername is required" });
    return;
  }

  const seller = store.getAccountByUsername(sellerUsername.trim());
  if (!seller || seller.role !== "seller") {
    res.status(404).json({ error: "Seller not found" });
    return;
  }

  const roomId = `r${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  store.getOrCreateRoomWithMeta(roomId, {
    buyerId: buyer.userId,
    sellerId: seller.userId,
    description: description?.trim() ?? "",
    requestAmount: amount ? Number(amount) : undefined,
    requestCurrency: currency ?? "SAR",
  });

  // Ensure both users exist in Stream and are in the channel
  await upsertUser(buyer.userId, buyer.displayName, "client");
  await upsertUser(seller.userId, seller.displayName, "user");
  await getOrCreateChannel(roomId, buyer.userId, seller.userId);
  await ensureUserInChannel(roomId, buyer.userId, buyer.displayName);
  await ensureUserInChannel(roomId, seller.userId, seller.displayName);

  store.addRoomToSeller(seller.userId, roomId);
  store.addRoomToBuyer(buyer.userId, roomId);

  if (isStreamEnabled()) {
    await sendSystemMessage(
      roomId,
      `🤝 ${buyer.displayName} opened a Vaultalk negotiation room with ${seller.displayName}. The AI Witness is now active — it will extract contract terms as you negotiate.`,
    );
  }

  res.json({ roomId, channelId: `room-${roomId}`, streamEnabled: isStreamEnabled() });
});

// ── New: get all rooms for the authenticated user ──────────────────────────

router.get("/user/rooms", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const account = token ? store.getAccountByToken(token) : null;

  if (!account) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const roomIds =
    account.role === "seller"
      ? store.getSellerRooms(account.userId)
      : store.getBuyerRooms(account.userId);

  const rooms = roomIds
    .map((roomId) => {
      const room = store.getRoom(roomId);
      const escrow = store.getEscrow(roomId);
      if (!room) return null;

      const counterpartId = account.role === "seller" ? room.buyerId : room.sellerId;
      const counterpart = counterpartId ? store.getAccountById(counterpartId) : null;

      return {
        roomId,
        counterpartName: counterpart?.displayName ?? "Unknown",
        counterpartUsername: counterpart?.username ?? "",
        description: room.description ?? "",
        amount: room.requestAmount ?? escrow?.amount ?? null,
        currency: room.requestCurrency ?? escrow?.currency ?? "SAR",
        escrowStatus: escrow?.status ?? "empty",
        createdAt: room.createdAt,
      };
    })
    .filter(Boolean)
    .reverse(); // newest first

  res.json({ rooms });
});

// ── Legacy: create room (still used by old join flow) ──────────────────────

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
