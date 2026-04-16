import { Router, type IRouter } from "express";
import { GenerateContractBody, ExportContractBody } from "@workspace/api-zod";
import { z } from "zod";
import { extractTerms, generateContractText, generateContractTextArabic, type ContractTerms } from "../lib/ai";
import { generateBilingualPdf } from "../lib/pdf";
import * as store from "../lib/store";
import { sendSystemMessage, isStreamEnabled } from "../lib/streamchat";

const router: IRouter = Router();

const DownloadPdfBody = z.object({
  roomId: z.string(),
  terms: z.object({
    price: z.number().nullable(),
    currency: z.string(),
    deliverables: z.array(z.string()),
    deadline: z.string().nullable(),
    revisions: z.number().nullable(),
    status: z.enum(["negotiating", "near-agreement", "agreed"]),
    confidence: z.number().optional(),
    summary: z.string().nullable().optional(),
  }),
  clientName: z.string(),
  freelancerName: z.string(),
});

// Deprecated schema — kept inline since send-to-chat was removed from the OpenAPI spec
const SendContractToChatBody = z.object({
  roomId: z.string(),
  language: z.enum(["en", "ar"]),
  terms: z.object({
    price: z.number().nullable(),
    currency: z.string(),
    deliverables: z.array(z.string()),
    deadline: z.string().nullable(),
    revisions: z.number().nullable(),
    status: z.enum(["negotiating", "near-agreement", "agreed"]),
  }),
  clientName: z.string().optional(),
  freelancerName: z.string().optional(),
});

router.post("/contract/generate", async (req, res): Promise<void> => {
  const parsed = GenerateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, messages } = parsed.data;

  for (const msg of messages) {
    store.addMessage(roomId, msg);
  }

  const allMessages = store.getMessages(roomId);
  const terms = await extractTerms(allMessages);

  const room = store.getOrCreateRoom(roomId);
  const client = room.participants.find((p) => p.role === "client");
  const freelancer = room.participants.find((p) => p.role === "freelancer");
  const buyerAccount = store.getAccountById(room.buyerId ?? "");
  const sellerAccount = store.getAccountById(room.sellerId ?? "");
  const resolvedClientName = buyerAccount?.username ?? client?.userName ?? "Client";
  const merchantName = sellerAccount?.username ?? freelancer?.userName ?? "Merchant";

  const contractText = generateContractText(
    terms,
    resolvedClientName,
    merchantName,
    roomId,
  );

  // Send system message when terms reach agreement — only ONCE per room,
  // and as a non-blocking fire-and-forget so it never delays the response.
  if (isStreamEnabled()) {
    if (terms.status === "agreed") {
      const isFirst = store.markAgreedNotified(roomId);
      if (isFirst) {
        sendSystemMessage(
          roomId,
          `✅ AI Witness: Terms are aligned! Price: ${terms.price} ${terms.currency}. Click "Lock Payment in Escrow" to secure the deal.`,
        ).catch(() => {});
      }
    } else {
      // If status drops back (more negotiation), allow a future re-notify
      store.clearAgreedNotified(roomId);
    }
  }

  res.json({ terms, contractText });
});

/**
 * Export contract as a bilingual PDF document.
 * Previously returned plain text; now returns application/pdf.
 */
router.post("/contract/export", async (req, res): Promise<void> => {
  const parsed = ExportContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, terms, clientName, freelancerName } = parsed.data;

  const fullTerms: ContractTerms = {
    price: (terms as ContractTerms).price,
    currency: terms.currency,
    deliverables: terms.deliverables,
    deadline: (terms as ContractTerms).deadline,
    revisions: (terms as ContractTerms).revisions,
    status: terms.status as ContractTerms["status"],
    confidence: 1,
    summary: null,
  };

  const exportRoom = store.getOrCreateRoom(roomId);
  const exportSellerAccount = store.getAccountById(exportRoom.sellerId ?? "");
  const exportMerchantName = exportSellerAccount?.username ?? freelancerName;

  const pdfBuffer = await generateBilingualPdf(
    fullTerms,
    clientName,
    exportMerchantName,
    roomId,
  );

  const fileName = `vaultalk-contract-${roomId}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.send(pdfBuffer);
});

router.post("/contract/download-pdf", async (req, res): Promise<void> => {
  const parsed = DownloadPdfBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, terms, clientName, freelancerName } = parsed.data;

  // Prefer names stored server-side if available; use seller username as merchant name
  const room = store.getOrCreateRoom(roomId);
  const clientParticipant = room.participants.find((p) => p.role === "client");
  const freelancerParticipant = room.participants.find((p) => p.role === "freelancer");
  const downloadBuyerAccount = store.getAccountById(room.buyerId ?? "");
  const downloadSellerAccount = store.getAccountById(room.sellerId ?? "");
  const resolvedClientName =
    downloadBuyerAccount?.username ?? clientParticipant?.userName ?? clientName;
  const resolvedFreelancerName =
    downloadSellerAccount?.username ?? freelancerParticipant?.userName ?? freelancerName;

  const fullTerms: ContractTerms = {
    price: terms.price,
    currency: terms.currency,
    deliverables: terms.deliverables,
    deadline: terms.deadline,
    revisions: terms.revisions,
    status: terms.status,
    confidence: terms.confidence ?? 1,
    summary: terms.summary ?? null,
  };

  const pdfBuffer = await generateBilingualPdf(
    fullTerms,
    resolvedClientName,
    resolvedFreelancerName,
    roomId,
  );

  const fileName = `vaultalk-contract-${roomId}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.send(pdfBuffer);
});

/**
 * Deprecated: no longer posts full contract text to chat.
 * Sends a short notice instead so parties know to download the PDF.
 * Frontend no longer calls this route; kept for backward compatibility.
 */
router.post("/contract/send-to-chat", async (req, res): Promise<void> => {
  const parsed = SendContractToChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, language } = parsed.data;

  if (isStreamEnabled()) {
    const notice =
      language === "ar"
        ? "📄 تم توقيع العقد — يمكن تحميل العقد الرسمي بصيغة PDF من منصة Vaultalk."
        : "📄 Contract signed — download the official bilingual PDF from the Vaultalk platform.";
    await sendSystemMessage(roomId, notice);
  }

  res.json({ success: true, contractText: "" });
});

export default router;
