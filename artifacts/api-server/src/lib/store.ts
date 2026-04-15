export interface User {
  userId: string;
  userName: string;
  role: "client" | "freelancer";
  roomId: string;
}

export interface Room {
  roomId: string;
  channelId: string;
  participants: User[];
  messages: string[];
  createdAt: Date;
}

export interface Escrow {
  roomId: string;
  amount: number | null;
  currency: string | null;
  status: "empty" | "locked" | "released" | "disputed";
  paymentLinkUrl: string | null;
  clientId: string | null;
  freelancerId: string | null;
}

const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const escrows = new Map<string, Escrow>();

export function createUser(user: User): User {
  users.set(user.userId, user);
  return user;
}

export function getUser(userId: string): User | undefined {
  return users.get(userId);
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
    escrows.set(roomId, {
      roomId,
      amount: null,
      currency: null,
      status: "empty",
      paymentLinkUrl: null,
      clientId: null,
      freelancerId: null,
    });
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
): Escrow {
  const escrow: Escrow = {
    roomId,
    amount,
    currency,
    status: "locked",
    paymentLinkUrl,
    clientId,
    freelancerId,
  };
  escrows.set(roomId, escrow);
  return escrow;
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
