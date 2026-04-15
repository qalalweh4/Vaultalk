import { logger } from "./logger";

const STREAMPAY_BASE_URL = "https://stream-app-service.streampay.sa";

export function isStreamPayEnabled(): boolean {
  return !!process.env.STREAMPAY_API_KEY;
}

export interface PaymentLinkResult {
  url: string | null;
  id: string | null;
}

export async function createPaymentLink(
  amount: number,
  currency: string,
  description: string,
): Promise<PaymentLinkResult> {
  const apiKey = process.env.STREAMPAY_API_KEY;
  if (!apiKey) {
    logger.info("StreamPay not configured — demo mode");
    return { url: null, id: null };
  }

  try {
    const response = await fetch(`${STREAMPAY_BASE_URL}/v2/payment_links`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: description || "Vaultalk Escrow Payment",
        description: `Freelance payment via Vaultalk — ${amount} ${currency}`,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, body: errorText }, "StreamPay API error");
      return { url: null, id: null };
    }

    const data = (await response.json()) as { url?: string; id?: string; link?: string };
    logger.info({ data }, "StreamPay payment link created");
    return {
      url: data.url ?? data.link ?? null,
      id: data.id ?? null,
    };
  } catch (err) {
    logger.error({ err }, "Failed to call StreamPay API");
    return { url: null, id: null };
  }
}
