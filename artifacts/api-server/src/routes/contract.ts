import { Router, type IRouter } from "express";
import { GenerateContractBody, ExportContractBody } from "@workspace/api-zod";
import { extractTerms, generateContractText, type ContractTerms } from "../lib/ai";
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

  if (terms.status === "agreed" && isStreamEnabled()) {
    await sendSystemMessage(
      roomId,
      `✅ AI Witness: Terms are aligned! Price: ${terms.price} ${terms.currency}. Both parties can type /agree to lock this contract.`,
    );
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

export default router;
