import { Router, type IRouter } from "express";
import { LockPaymentBody, ReleasePaymentBody } from "@workspace/api-zod";
import * as store from "../lib/store";
import { createPaymentLink, isStreamPayEnabled } from "../lib/streampay";
import { sendSystemMessage, isStreamEnabled } from "../lib/streamchat";
import { generateContractText, generateContractTextArabic } from "../lib/ai";

const router: IRouter = Router();

router.post("/payments/lock", async (req, res): Promise<void> => {
  const parsed = LockPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, amount, currency, clientId, freelancerId, description } = parsed.data;

  const result = await createPaymentLink(
    amount,
    currency,
    description ?? `Vaultalk escrow — Room ${roomId}`,
  );

  const escrow = store.lockEscrow(roomId, amount, currency, result.url, clientId, freelancerId, result.id ?? null);

  // Payment link message is client-only — the freelancer doesn't need to see the link
  if (isStreamEnabled()) {
    const msg = result.url
      ? `💳 StreamPay payment link ready: ${result.url}\nAmount: ${amount} ${currency} — click the link to fund the escrow.`
      : `💳 Escrow: ${amount} ${currency} marked as locked (demo mode).`;
    sendSystemMessage(roomId, msg, { client_only: true }).catch(() => {});
  }

  res.json({
    paymentLinkUrl: result.url,
    escrow,
    streamPayEnabled: isStreamPayEnabled(),
  });
});

router.post("/payments/release", async (req, res): Promise<void> => {
  const parsed = ReleasePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId } = parsed.data;
  const escrow = store.releaseEscrow(roomId);

  // Only send release notification once even if multiple tabs trigger release
  if (isStreamEnabled()) {
    const isFirst = store.markReleaseNotified(roomId);
    if (isFirst) {
      sendSystemMessage(
        roomId,
        "🎉 Payment released to freelancer. Deal complete! Vaultalk thanks you for using trusted AI negotiations.",
      ).catch(() => {});
    }
  }

  res.json({ success: true, escrow });
});

// TODO production: verify StreamPay webhook signature here before trusting this payload
router.post("/payments/webhook", async (req, res): Promise<void> => {
  const payload = req.body ?? {};
  const linkId: string | undefined = payload.payment_link_id ?? payload.id ?? payload.linkId;
  const status: string = (payload.status ?? "").toUpperCase();

  res.json({ received: true });

  if (!linkId) return;

  const roomId = store.getRoomIdByLinkId(linkId);
  if (!roomId) return;

  const SUCCESS_STATUSES = ["PAID", "COMPLETED", "SUCCESS"];
  const FAILURE_STATUSES = ["FAILED", "EXPIRED", "CANCELLED"];

  if (SUCCESS_STATUSES.includes(status)) {
    store.releaseEscrow(roomId);
    if (isStreamEnabled()) {
      const isFirst = store.markReleaseNotified(roomId);
      if (isFirst) {
        sendSystemMessage(
          roomId,
          "🟢 StreamPay confirmed payment received. Escrow released — deal complete!",
        ).catch(() => {});
      }
    }
  } else if (FAILURE_STATUSES.includes(status)) {
    store.disputeEscrow(roomId);
    if (isStreamEnabled()) {
      sendSystemMessage(
        roomId,
        "🔴 StreamPay reported a payment failure. Funds remain frozen.",
      ).catch(() => {});
    }
  }
});

export default router;
