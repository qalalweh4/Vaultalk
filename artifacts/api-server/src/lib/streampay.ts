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
 * Derive the public webhook URL so StreamPay can POST payment events back to us.
 * Uses WEBHOOK_BASE_URL env var if set (production), falls back to REPLIT_DEV_DOMAIN
 * (Replit dev environment), or null if neither is available.
 */
function resolveWebhookUrl(): string | null {
  if (process.env.WEBHOOK_BASE_URL) {
    return `${process.env.WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/payments/webhook`;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}/api/payments/webhook`;
  }
  return null;
}

/**
 * Step 2 — Create a payment link for the given product.
 * Passes our webhook URL so StreamPay posts payment events back automatically.
 */
async function createLink(
  productId: string,
  amount: number,
  currency: string,
  name: string,
): Promise<PaymentLinkResult> {
  const webhookUrl = resolveWebhookUrl();

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
        ...(webhookUrl ? { webhook_url: webhookUrl, callback_url: webhookUrl } : {}),
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
 * Attempts to find the StreamPay invoice number for a payment link.
 * First checks the payment link object itself; if not present there,
 * searches the invoices endpoint filtering by payment_link_id.
 * Returns null if the invoice number cannot be determined.
 */
export async function fetchInvoiceNumberForLink(linkId: string): Promise<string | null> {
  if (!process.env.STREAMPAY_API_KEY) return null;
  try {
    // 1. Try the payment link object directly
    const linkResp = await fetch(
      `${STREAMPAY_BASE_URL}/api/v2/payment_links/${encodeURIComponent(linkId)}`,
      { headers: apiHeaders() },
    );
    if (linkResp.ok) {
      const linkData = (await linkResp.json()) as {
        invoice_number?: string;
        invoice_id?: string;
        invoice?: { number?: string; id?: string };
      };
      const fromLink =
        linkData.invoice_number ??
        linkData.invoice?.number ??
        linkData.invoice_id ??
        linkData.invoice?.id ??
        null;
      if (fromLink) return fromLink;
    }

    // 2. Fall back: query invoices filtered by payment_link_id
    const invResp = await fetch(
      `${STREAMPAY_BASE_URL}/api/v2/invoices?payment_link_id=${encodeURIComponent(linkId)}&limit=1`,
      { headers: apiHeaders() },
    );
    if (invResp.ok) {
      const invData = (await invResp.json()) as {
        data?: Array<{ invoice_number?: string; number?: string; id?: string }>;
        results?: Array<{ invoice_number?: string; number?: string; id?: string }>;
      };
      const items = invData.data ?? invData.results ?? [];
      const first = items[0];
      if (first) {
        return first.invoice_number ?? first.number ?? first.id ?? null;
      }
    }
  } catch (err) {
    logger.error({ err, linkId }, "StreamPay: error fetching invoice number");
  }
  return null;
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
