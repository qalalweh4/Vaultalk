import Anthropic from "@anthropic-ai/sdk";
import { logger } from "./logger";

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  if (!baseURL || !apiKey) return null;
  if (!_client) {
    _client = new Anthropic({ baseURL, apiKey });
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
  confidence: number;
  summary: string | null;
}

const DEFAULT_TERMS: ContractTerms = {
  price: null,
  currency: "SAR",
  deliverables: [],
  deadline: null,
  revisions: null,
  status: "negotiating",
  confidence: 0,
  summary: null,
};

const SYSTEM_PROMPT = `You are a contract term extractor for a freelance negotiation platform called Vaultalk.
Read the negotiation chat and extract the current agreed terms. Be precise and only extract terms that have been explicitly stated or agreed upon.

Return ONLY a valid JSON object with exactly these keys:
- price: number or null (the agreed payment amount)
- currency: string (currency code, default "SAR")
- deliverables: string[] (list of deliverables/work items)
- deadline: string or null (deadline or timeline as stated)
- revisions: number or null (number of revisions included)
- status: one of "negotiating" | "near-agreement" | "agreed"
  - "negotiating": still discussing, no clear agreement
  - "near-agreement": terms are close, minor points left
  - "agreed": both parties have explicitly agreed or used /agree
- confidence: number between 0 and 1 (how confident you are in the extraction)
- summary: string or null (one sentence summary of current negotiation state)

Return ONLY the JSON object. No explanation, no markdown, no code blocks.`;

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : trimmed;
}

export async function extractTerms(messages: string[]): Promise<ContractTerms> {
  const client = getClient();
  if (!client || messages.length === 0) return DEFAULT_TERMS;

  const conversation = messages.slice(-60).join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract contract terms from this negotiation chat:\n\n${conversation}`,
        },
        {
          role: "assistant",
          content: "{",
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") return DEFAULT_TERMS;

    const rawJson = "{" + block.text;
    const content = extractJson(rawJson);
    const parsed = JSON.parse(content) as Partial<ContractTerms>;

    return {
      price: typeof parsed.price === "number" ? parsed.price : null,
      currency: typeof parsed.currency === "string" && parsed.currency ? parsed.currency : "SAR",
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      deadline: typeof parsed.deadline === "string" ? parsed.deadline : null,
      revisions: typeof parsed.revisions === "number" ? parsed.revisions : null,
      status: (["negotiating", "near-agreement", "agreed"] as const).includes(
        parsed.status as "negotiating" | "near-agreement" | "agreed"
      )
        ? (parsed.status as ContractTerms["status"])
        : "negotiating",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0,
      summary: typeof parsed.summary === "string" ? parsed.summary : null,
    };
  } catch (err) {
    logger.error({ err }, "Claude contract extraction failed");
    return DEFAULT_TERMS;
  }
}

export function generateContractTextArabic(
  terms: ContractTerms,
  clientName: string,
  merchantName: string,
  roomId: string,
): string {
  const date = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const deliverablesText =
    terms.deliverables.length > 0
      ? terms.deliverables.map((d, i) => `  ${i + 1}. ${d}`).join("\n")
      : "  (يُحدد لاحقاً)";

  return `عقد خدمات مستقلة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

رقم المرجع: VAULTALK-${roomId.toUpperCase()}
التاريخ: ${date}

الأطراف:
  العميل:     ${clientName}
  التاجر:     ${merchantName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الشروط المتفق عليها
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الأتعاب:         ${terms.price !== null ? `${terms.price} ${terms.currency}` : "يُحدد لاحقاً"}
الموعد النهائي:  ${terms.deadline ?? "يُحدد لاحقاً"}
التعديلات:       ${terms.revisions !== null ? `${terms.revisions} جولات` : "يُحدد لاحقاً"}

المُسلَّمات:
${deliverablesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الدفع
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

يُحتجز مبلغ ${terms.price !== null ? `${terms.price} ${terms.currency}` : "المبلغ المتفق عليه"}
في الضمان عبر StreamPay ويُصرف عند الانتهاء من
تسليم جميع المُسلَّمات والموافقة عليها.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
شهادة الشاهد الذكي — بدعم من Claude AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

تمت مفاوضة هذه الاتفاقية وشهد عليها Vaultalk AI (Claude).
استخرج الشاهد الذكي جميع الشروط وتحقق منها من نص التفاوض
في الغرفة ${roomId}.

أكد الطرفان رقمياً على هذه الشروط عبر منصة Vaultalk.

بدعم من Vaultalk — مفاوضات عقود موثوقة بالذكاء الاصطناعي
مبني على StreamPay · Stream Chat · Claude AI | Streamathon 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export function generateContractText(
  terms: ContractTerms,
  clientName: string,
  merchantName: string,
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
  Merchant:   ${merchantName}

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
AI WITNESS CERTIFICATE — Powered by Claude AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This agreement was negotiated and witnessed by Vaultalk AI (Claude).
The AI Witness extracted and verified all terms from the negotiation
transcript in room ${roomId}.

Both parties have digitally confirmed these terms via the Vaultalk platform.

Powered by Vaultalk — Trusted AI Contract Negotiations
Built on StreamPay · Stream Chat · Claude AI | Streamathon 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
