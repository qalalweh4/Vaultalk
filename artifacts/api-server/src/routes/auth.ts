import { Router, type IRouter } from "express";
import { JoinRoomBody, JoinRoomResponse } from "@workspace/api-zod";
import * as store from "../lib/store";
import { createUserToken, upsertUser, ensureUserInChannel } from "../lib/streamchat";

const router: IRouter = Router();

// ── New account-based auth ─────────────────────────────────────────────────

router.post("/auth/register", async (req, res): Promise<void> => {
  const { username, password, role, displayName } = req.body ?? {};
  if (!username || !password || !role || !displayName) {
    res.status(400).json({ error: "All fields required" });
    return;
  }
  if (role !== "buyer" && role !== "seller") {
    res.status(400).json({ error: "Role must be buyer or seller" });
    return;
  }

  const account = store.registerAccount(username.trim(), password, role, displayName.trim());
  if (!account) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const streamRole = role === "buyer" ? "client" : "freelancer";
  await upsertUser(account.userId, displayName.trim(), streamRole);
  const streamToken = createUserToken(account.userId);

  res.json({
    userId: account.userId,
    username: account.username,
    role: account.role,
    displayName: account.displayName,
    token: account.token,
    streamToken,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const account = store.loginAccount(username.trim(), password);
  if (!account) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const streamToken = createUserToken(account.userId);

  res.json({
    userId: account.userId,
    username: account.username,
    role: account.role,
    displayName: account.displayName,
    token: account.token,
    streamToken,
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const account = store.getAccountByToken(token);
  if (!account) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const streamToken = createUserToken(account.userId);
  res.json({
    userId: account.userId,
    username: account.username,
    role: account.role,
    displayName: account.displayName,
    streamToken,
  });
});

// ── Legacy join (kept for backwards compat) ────────────────────────────────

router.post("/auth/join", async (req, res): Promise<void> => {
  const parsed = JoinRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, role, roomId } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const userId = `${slug}-${Date.now()}`;

  await upsertUser(userId, name, role);
  await ensureUserInChannel(roomId, userId, name);

  const streamToken = createUserToken(userId);

  const user = store.createUser({
    userId,
    userName: name,
    role: role as "client" | "freelancer",
    roomId,
  });

  store.addParticipant(roomId, user);

  res.json(
    JoinRoomResponse.parse({
      userId,
      userName: name,
      role,
      streamToken,
      roomId,
    }),
  );
});

export default router;
