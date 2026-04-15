export interface User {
  userId: string;
  userName: string;
  role: "client" | "freelancer";
  roomId: string;
}

export interface Account {
  userId: string;
  username: string;
  password: string;
  role: "buyer" | "seller";
  displayName: string;
  token: string;
}

export interface Room {
  roomId: string;
  channelId: string;
  participants: User[];
  messages: string[];
  createdAt: Date;
  buyerId?: string;
  sellerId?: string;
  description?: string;
  requestAmount?: number;
  requestCurrency?: string;
}

export interface Escrow {
  roomId: string;
  amount: number | null;
  currency: string | null;
  status: "empty" | "locked" | "released" | "disputed";
  paymentLinkUrl: string | null;
  paymentLinkId: string | null;
  clientId: string | null;
  freelancerId: string | null;
}

const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const escrows = new Map<string, Escrow>();
const linkRoomMap = new Map<string, string>(); // paymentLinkId → roomId

// Account management
const accounts = new Map<string, Account>(); // by username
const accountsByToken = new Map<string, Account>();
const accountsById = new Map<string, Account>();
const sellerRooms = new Map<string, string[]>(); // sellerId -> roomIds
const buyerRooms = new Map<string, string[]>(); // buyerId -> roomIds

// ── Demo accounts seeded at startup ───────────────────────────────────────
// These match the vaultalkUsername values used in the Souk market seed data.
function seedAccounts() {
  const demos: Array<{ username: string; password: string; role: "buyer" | "seller"; displayName: string }> = [
    { username: "sara2",        password: "demo123", role: "seller", displayName: "Sara Mohammed" },
    { username: "sara_designs", password: "demo123", role: "seller", displayName: "Sara Designs Studio" },
    { username: "demo_buyer",   password: "demo123", role: "buyer",  displayName: "Ahmed Al-Rashid" },
  ];
  for (const d of demos) {
    if (!accounts.has(d.username)) {
      const userId = `${d.role}_${d.username}`;
      const token = [...Array(40)].map(() => Math.random().toString(36)[2]).join("");
      const account: Account = { userId, username: d.username, password: d.password, role: d.role, displayName: d.displayName, token };
      accounts.set(d.username, account);
      accountsByToken.set(token, account);
      accountsById.set(userId, account);
    }
  }
}

seedAccounts();

// Track which rooms have already had their "terms agreed" notification sent
const agreedNotified = new Set<string>();

export function markAgreedNotified(roomId: string): boolean {
  if (agreedNotified.has(roomId)) return false;
  agreedNotified.add(roomId);
  return true;
}

export function clearAgreedNotified(roomId: string): void {
  agreedNotified.delete(roomId);
}

// Track which rooms have already had their "payment released" notification sent
const releaseNotified = new Set<string>();

export function markReleaseNotified(roomId: string): boolean {
  if (releaseNotified.has(roomId)) return false;
  releaseNotified.add(roomId);
  return true;
}

// --- Account functions ---

export function registerAccount(
  username: string,
  password: string,
  role: "buyer" | "seller",
  displayName: string,
): Account | null {
  if (accounts.has(username)) return null;
  const userId = `${role}_${username}`;
  const token = [...Array(40)].map(() => Math.random().toString(36)[2]).join("");
  const account: Account = { userId, username, password, role, displayName, token };
  accounts.set(username, account);
  accountsByToken.set(token, account);
  accountsById.set(userId, account);
  return account;
}

export function loginAccount(username: string, password: string): Account | null {
  const account = accounts.get(username);
  if (!account || account.password !== password) return null;
  return account;
}

export function getAccountByToken(token: string): Account | undefined {
  return accountsByToken.get(token);
}

export function getAccountById(userId: string): Account | undefined {
  return accountsById.get(userId);
}

export function getAccountByUsername(username: string): Account | undefined {
  return accounts.get(username);
}

export function addRoomToSeller(sellerId: string, roomId: string): void {
  const list = sellerRooms.get(sellerId) ?? [];
  if (!list.includes(roomId)) list.push(roomId);
  sellerRooms.set(sellerId, list);
}

export function addRoomToBuyer(buyerId: string, roomId: string): void {
  const list = buyerRooms.get(buyerId) ?? [];
  if (!list.includes(roomId)) list.push(roomId);
  buyerRooms.set(buyerId, list);
}

export function getSellerRooms(sellerId: string): string[] {
  return sellerRooms.get(sellerId) ?? [];
}

export function getBuyerRooms(buyerId: string): string[] {
  return buyerRooms.get(buyerId) ?? [];
}

// --- User functions ---

export function createUser(user: User): User {
  users.set(user.userId, user);
  return user;
}

export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

// --- Room functions ---

function initEscrow(roomId: string) {
  if (!escrows.has(roomId)) {
    escrows.set(roomId, {
      roomId,
      amount: null,
      currency: null,
      status: "empty",
      paymentLinkUrl: null,
      paymentLinkId: null,
      clientId: null,
      freelancerId: null,
    });
  }
}

export function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      channelId: `room-${roomId}`,
      participants: [],
      messages: [],
      createdAt: new Date(),
    });
    initEscrow(roomId);
  }
  return rooms.get(roomId)!;
}

export function getOrCreateRoomWithMeta(
  roomId: string,
  meta: {
    buyerId?: string;
    sellerId?: string;
    description?: string;
    requestAmount?: number;
    requestCurrency?: string;
  },
): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomId,
      channelId: `room-${roomId}`,
      participants: [],
      messages: [],
      createdAt: new Date(),
      ...meta,
    });
    initEscrow(roomId);
  }
  return rooms.get(roomId)!;
}

export function addParticipant(roomId: string, user: User): void {
  const room = getOrCreateRoom(roomId);
  const exists = room.participants.find((p) => p.userId === user.userId);
  if (!exists) {
    room.participants.push(user);
  } else {
    const idx = room.participants.findIndex((p) => p.userId === user.userId);
    room.participants[idx] = user;
  }
}

export function addMessage(roomId: string, message: string): void {
  const room = getOrCreateRoom(roomId);
  room.messages.push(message);
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }
}

export function getMessages(roomId: string): string[] {
  return rooms.get(roomId)?.messages ?? [];
}

export function getEscrow(roomId: string): Escrow | null {
  return escrows.get(roomId) ?? null;
}

export function lockEscrow(
  roomId: string,
  amount: number,
  currency: string,
  paymentLinkUrl: string | null,
  clientId: string,
  freelancerId: string,
  paymentLinkId?: string | null,
): Escrow {
  const escrow: Escrow = {
    roomId,
    amount,
    currency,
    status: "locked",
    paymentLinkUrl,
    paymentLinkId: paymentLinkId ?? null,
    clientId,
    freelancerId,
  };
  escrows.set(roomId, escrow);
  if (paymentLinkId) linkRoomMap.set(paymentLinkId, roomId);
  return escrow;
}

export function getRoomIdByLinkId(linkId: string): string | undefined {
  return linkRoomMap.get(linkId);
}

export function releaseEscrow(roomId: string): Escrow {
  const escrow = escrows.get(roomId);
  if (escrow) {
    escrow.status = "released";
  }
  return (
    escrow ?? {
      roomId,
      amount: null,
      currency: null,
      status: "released",
      paymentLinkUrl: null,
      paymentLinkId: null,
      clientId: null,
      freelancerId: null,
    }
  );
}

export function disputeEscrow(roomId: string): void {
  const escrow = escrows.get(roomId);
  if (escrow) {
    escrow.status = "disputed";
  }
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}
