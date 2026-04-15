import { logger } from "./logger";

const STREAMPAY_BASE_URL = "https://stream-app-service.streampay.sa";

export function isStreamPayEnabled(): boolean {
  return !!process.env.STREAMPAY_API_KEY;
}

function apiHeaders() {
  return {
    "x-api-key": process.env.STREAMPAY_API_KEY ?? "",
    "Content-Type": "application/json",
  };
}

export interface PaymentLinkResult {
  url: string | null;
  id: string | null;
}

/**
 * Step 1 — Create a one-off product with the negotiated price.
 * Returns the product ID to use in the payment link.
 */
async function createProduct(
  amount: number,
  currency: string,
  description: string,
): Promise<string | null> {
  try {
    const resp = await fetch(`${STREAMPAY_BASE_URL}/api/v2/products`, {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: description,
        description: `Freelance contract payment via Vaultalk — ${amount} ${currency}`,
        type: "ONE_OFF",
        is_one_time: true,
        prices: [
          {
            currency: currency.toUpperCase(),
            amount,
            is_price_inclusive_of_vat: true,
          },
        ],
      }),
    });

    const data = (await resp.json()) as { id?: string; detail?: unknown };

    if (!resp.ok) {
      logger.error({ status: resp.status, body: data }, "StreamPay: failed to create product");
      return null;
    }

    logger.info({ productId: data.id }, "StreamPay: product created");
    return data.id ?? null;
  } catch (err) {
    logger.error({ err }, "StreamPay: error creating product");
    return null;
  }
}

/**
 * Step 2 — Create a payment link for the given product.
 * The link is general-purpose (no consumer pre-set) so the payer enters details at checkout.
 */
async function createLink(
  productId: string,
  amount: number,
  currency: string,
  name: string,
): Promise<PaymentLinkResult> {
  try {
    const resp = await fetch(`${STREAMPAY_BASE_URL}/api/v2/payment_links`, {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name,
        description: `Vaultalk AI-witnessed escrow — ${amount} ${currency}`,
        items: [{ product_id: productId, quantity: 1 }],
        currency: currency.toUpperCase(),
        contact_information_type: "PHONE",
        max_number_of_payments: 1,
        custom_metadata: { source: "vaultalk", amount, currency },
      }),
    });

    const data = (await resp.json()) as {
      url?: string;
      link?: string;
      id?: string;
      detail?: unknown;
    };

    if (!resp.ok) {
      logger.error({ status: resp.status, body: data }, "StreamPay: failed to create payment link");
      return { url: null, id: null };
    }

    logger.info({ url: data.url, id: data.id }, "StreamPay: payment link created");
    return { url: data.url ?? data.link ?? null, id: data.id ?? null };
  } catch (err) {
    logger.error({ err }, "StreamPay: error creating payment link");
    return { url: null, id: null };
  }
}

/**
 * Full flow: create a product then a payment link for that product.
 * Returns the checkout URL and payment link ID.
 */
export async function createPaymentLink(
  amount: number,
  currency: string,
  description: string,
): Promise<PaymentLinkResult> {
  if (!isStreamPayEnabled()) {
    logger.info("StreamPay not configured — demo mode");
    return { url: null, id: null };
  }

  const linkName = description || `Vaultalk Escrow — ${amount} ${currency}`;
  const productId = await createProduct(amount, currency, linkName);
  if (!productId) return { url: null, id: null };

  return createLink(productId, amount, currency, linkName);
}
