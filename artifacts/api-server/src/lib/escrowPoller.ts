/**
 * Server-side escrow poller.
 *
 * Every POLL_INTERVAL_MS the poller calls the StreamPay API to check the status
 * of every payment link that is still in the "locked" state.  When StreamPay
 * reports the link as paid the escrow is released automatically; when it is
 * expired or cancelled the escrow is disputed.
 *
 * This approach does NOT require any webhook configuration in the StreamPay
 * dashboard — it works purely by polling the GET /api/v2/payment_links/{id}
 * endpoint.
 */

import { logger } from "./logger";
import * as store from "./store";
import { sendSystemMessage, isStreamEnabled } from "./streamchat";

const STREAMPAY_BASE_URL = "https://stream-app-service.streampay.sa";
const POLL_INTERVAL_MS = 10_000; // 10 seconds — fast enough for a demo

function apiHeaders() {
  return {
    "x-api-key": process.env.STREAMPAY_API_KEY ?? "",
    "Content-Type": "application/json",
  };
}

async function checkLinkStatus(linkId: string): Promise<string | null> {
  try {
    const resp = await fetch(
      `${STREAMPAY_BASE_URL}/api/v2/payment_links/${encodeURIComponent(linkId)}`,
      { headers: apiHeaders() },
    );
    if (!resp.ok) {
      logger.warn({ linkId, status: resp.status }, "escrowPoller: payment link fetch failed");
      return null;
    }
    const data = (await resp.json()) as { status?: string };
    return (data.status ?? "").toLowerCase();
  } catch (err) {
    logger.error({ err, linkId }, "escrowPoller: error fetching payment link");
    return null;
  }
}

async function pollOnce() {
  const locked = store.getLockedEscrowsWithLinkIds();
  if (locked.length === 0) return;

  await Promise.allSettled(
    locked.map(async ({ roomId, paymentLinkId }) => {
      const status = await checkLinkStatus(paymentLinkId);
      if (!status) return;

      if (status === "paid" || status === "completed") {
        store.releaseEscrow(roomId);
        logger.info({ roomId, paymentLinkId, status }, "escrowPoller: releasing escrow");
        if (isStreamEnabled()) {
          const isFirst = store.markReleaseNotified(roomId);
          if (isFirst) {
            sendSystemMessage(
              roomId,
              "🟢 StreamPay confirmed payment received. Escrow released — deal complete!",
            ).catch(() => {});
          }
        }
      } else if (status === "expired" || status === "cancelled") {
        store.disputeEscrow(roomId);
        logger.info({ roomId, paymentLinkId, status }, "escrowPoller: disputing escrow");
        if (isStreamEnabled()) {
          sendSystemMessage(
            roomId,
            "🔴 StreamPay payment link expired or was cancelled. Funds remain frozen.",
          ).catch(() => {});
        }
      }
    }),
  );
}

export function startEscrowPoller() {
  if (!process.env.STREAMPAY_API_KEY) {
    logger.info("escrowPoller: StreamPay not configured — poller disabled");
    return;
  }
  logger.info({ intervalMs: POLL_INTERVAL_MS }, "escrowPoller: starting");
  setInterval(() => {
    pollOnce().catch((err) => logger.error({ err }, "escrowPoller: unhandled error"));
  }, POLL_INTERVAL_MS);
}
