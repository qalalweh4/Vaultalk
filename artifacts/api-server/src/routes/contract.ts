import { Router, type IRouter } from "express";
import { GenerateContractBody, ExportContractBody, SendContractToChatBody } from "@workspace/api-zod";
import { extractTerms, generateContractText, generateContractTextArabic, type ContractTerms } from "../lib/ai";
import * as store from "../lib/store";
import { sendSystemMessage, isStreamEnabled } from "../lib/streamchat";

const router: IRouter = Router();

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

  const contractText = generateContractText(
    terms,
    client?.userName ?? "Client",
    freelancer?.userName ?? "Freelancer",
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

router.post("/contract/export", async (req, res): Promise<void> => {
  const parsed = ExportContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, terms, clientName, freelancerName } = parsed.data;
  const contractText = generateContractText(
    terms as ContractTerms,
    clientName,
    freelancerName,
    roomId,
  );
  const fileName = `vaultalk-contract-${roomId}-${Date.now()}.txt`;

  res.json({ contractText, fileName });
});

router.post("/contract/send-to-chat", async (req, res): Promise<void> => {
  const parsed = SendContractToChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { roomId, language, terms } = parsed.data;

  // Always use the names stored server-side for accuracy
  const room = store.getOrCreateRoom(roomId);
  const clientParticipant = room.participants.find((p) => p.role === "client");
  const freelancerParticipant = room.participants.find((p) => p.role === "freelancer");
  const clientName = clientParticipant?.userName ?? parsed.data.clientName ?? "Client";
  const freelancerName = freelancerParticipant?.userName ?? parsed.data.freelancerName ?? "Freelancer";

  const contractText =
    language === "ar"
      ? generateContractTextArabic(terms as ContractTerms, clientName, freelancerName, roomId)
      : generateContractText(terms as ContractTerms, clientName, freelancerName, roomId);

  if (isStreamEnabled()) {
    const header = language === "ar" ? "📄 عقد رسمي موقَّع" : "📄 Signed Contract";
    await sendSystemMessage(roomId, `${header}\n\n${contractText}`);
  }

  res.json({ success: true, contractText });
});

export default router;
