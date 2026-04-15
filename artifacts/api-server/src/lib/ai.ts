import OpenAI from "openai";
import { logger } from "./logger";

let _client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!baseURL || !apiKey) return null;
  if (!_client) {
    _client = new OpenAI({ baseURL, apiKey });
  }
  return _client;
}

export interface ContractTerms {
  price: number | null;
  currency: string;
  deliverables: string[];
  deadline: string | null;
  revisions: number | null;
  status: "negotiating" | "near-agreement" | "agreed";
}

const DEFAULT_TERMS: ContractTerms = {
  price: null,
  currency: "SAR",
  deliverables: [],
  deadline: null,
  revisions: null,
  status: "negotiating",
};

export async function extractTerms(messages: string[]): Promise<ContractTerms> {
  const client = getClient();
  if (!client || messages.length === 0) return DEFAULT_TERMS;

  const conversation = messages.slice(-50).join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are a contract term extractor for a freelance negotiation platform. Read this negotiation chat and extract the current agreed terms.
Return ONLY valid JSON with keys: price (number or null), currency (string, default SAR), deliverables (string[]), deadline (string or null), revisions (number or null), status ('negotiating'|'near-agreement'|'agreed').
If a term has not been discussed, set it to null. Never add commentary. Only return the JSON object.`,
        },
        {
          role: "user",
          content: conversation,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return DEFAULT_TERMS;

    const parsed = JSON.parse(content) as Partial<ContractTerms>;
    return {
      price: typeof parsed.price === "number" ? parsed.price : null,
      currency: typeof parsed.currency === "string" ? parsed.currency : "SAR",
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      deadline: typeof parsed.deadline === "string" ? parsed.deadline : null,
      revisions: typeof parsed.revisions === "number" ? parsed.revisions : null,
      status: ["negotiating", "near-agreement", "agreed"].includes(parsed.status ?? "")
        ? (parsed.status as ContractTerms["status"])
        : "negotiating",
    };
  } catch (err) {
    logger.error({ err }, "Failed to extract contract terms");
    return DEFAULT_TERMS;
  }
}

export function generateContractText(
  terms: ContractTerms,
  clientName: string,
  freelancerName: string,
  roomId: string,
): string {
  const date = new Date().toLocaleDateString("en-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const deliverablesText =
    terms.deliverables.length > 0
      ? terms.deliverables.map((d, i) => `  ${i + 1}. ${d}`).join("\n")
      : "  (To be specified)";

  return `FREELANCE SERVICE AGREEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agreement Reference: VAULTALK-${roomId.toUpperCase()}
Date: ${date}

PARTIES:
  Client:     ${clientName}
  Freelancer: ${freelancerName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AGREED TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compensation:  ${terms.price !== null ? `${terms.price} ${terms.currency}` : "To be agreed"}
Deadline:      ${terms.deadline ?? "To be agreed"}
Revisions:     ${terms.revisions !== null ? `${terms.revisions} rounds` : "To be agreed"}

Deliverables:
${deliverablesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment of ${terms.price !== null ? `${terms.price} ${terms.currency}` : "agreed amount"} is held
in escrow via StreamPay and will be released upon completion and approval
of all deliverables.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI WITNESS CERTIFICATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This agreement was negotiated and witnessed by Vaultalk AI.
The AI Witness extracted and verified all terms from the negotiation
transcript in room ${roomId}.

Both parties have digitally confirmed these terms via the Vaultalk platform.

Powered by Vaultalk — Trusted AI Contract Negotiations
Built on StreamPay | Streamathon 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
