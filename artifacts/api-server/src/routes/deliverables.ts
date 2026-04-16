import { Router, type IRouter } from "express";
import * as store from "../lib/store";
import { sendSystemMessage, isStreamEnabled } from "../lib/streamchat";

const router: IRouter = Router();

/**
 * POST /rooms/:roomId/deliverables
 * Freelancer registers a file they uploaded (via Stream Chat) as a deliverable.
 * Auth required; caller must be the freelancer/seller of the room.
 */
router.post("/rooms/:roomId/deliverables", async (req, res): Promise<void> => {
  const { roomId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const account = token ? store.getAccountByToken(token) : null;

  if (!account) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (account.role !== "seller" && account.role !== "freelancer") {
    res.status(403).json({ error: "Only freelancers/sellers can upload deliverables" });
    return;
  }

  const { fileName, fileUrl } = req.body ?? {};
  if (!fileName || !fileUrl) {
    res.status(400).json({ error: "fileName and fileUrl are required" });
    return;
  }

  const deliverable = store.addDeliverable(roomId, { fileName, fileUrl });

  // Notify the room that files have been uploaded
  if (isStreamEnabled()) {
    sendSystemMessage(
      roomId,
      `📦 ${account.displayName} has uploaded the deliverables. Make payment to unlock and download the files.`,
    ).catch(() => {});
  }

  res.json({ deliverable });
});

/**
 * GET /rooms/:roomId/deliverables
 * Returns deliverables for the room.
 * - Freelancers/sellers always see full file URLs.
 * - Clients see file names only (locked) unless the escrow is released.
 */
router.get("/rooms/:roomId/deliverables", async (req, res): Promise<void> => {
  const { roomId } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const account = token ? store.getAccountByToken(token) : null;

  const deliverables = store.getDeliverables(roomId);
  const escrow = store.getEscrow(roomId);
  const isReleased = escrow?.status === "released";
  const isFreelancer = account?.role === "seller" || account?.role === "freelancer";

  // Freelancers or released escrow: return full data
  if (isFreelancer || isReleased) {
    res.json({
      deliverables: deliverables.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        uploadedAt: d.uploadedAt,
        locked: false,
      })),
      isReleased,
    });
    return;
  }

  // Client before payment: return names only
  res.json({
    deliverables: deliverables.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileUrl: null,
      uploadedAt: d.uploadedAt,
      locked: true,
    })),
    isReleased: false,
  });
});

export default router;
