import { Router, type IRouter } from "express";
import { LockPaymentBody, ReleasePaymentBody } from "@workspace/api-zod";
import * as store from "../lib/store";
import { createPaymentLink, isStreamPayEnabled } from "../lib/streampay";
import { sendSystemMessage, isStreamEnabled } from "../lib/streamchat";

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

  const escrow = store.lockEscrow(roomId, amount, currency, result.url, clientId, freelancerId);

  if (isStreamEnabled()) {
    const msg = result.url
      ? `💳 StreamPay: ${amount} ${currency} payment link created. Client: please complete the payment to lock funds in escrow.`
      : `💳 Escrow: ${amount} ${currency} marked as locked in Vaultalk escrow (demo mode).`;
    await sendSystemMessage(roomId, msg);
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

  if (isStreamEnabled()) {
    await sendSystemMessage(
      roomId,
      "🎉 Payment released to freelancer. Deal complete! Vaultalk thanks you for using trusted AI negotiations.",
    );
  }

  res.json({ success: true, escrow });
});

export default router;
