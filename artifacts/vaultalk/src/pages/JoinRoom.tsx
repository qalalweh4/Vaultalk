import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useJoinRoom, useCreateRoom } from "@workspace/api-client-react";
import { useUser } from "@/contexts/UserContext";
import { ShieldCheck, Sparkles, ArrowRight, RefreshCw } from "lucide-react";

function randomRoomId(): string {
  const words = ["swift", "nova", "lunar", "forge", "blade", "echo", "pixel", "spark", "nexus", "vault"];
  return `${words[Math.floor(Math.random() * words.length)]}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function JoinRoom() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"client" | "freelancer">("client");
  const [roomId, setRoomId] = useState(randomRoomId());

  const joinRoom = useJoinRoom();
  const createRoom = useCreateRoom();

  const handleEnter = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    if (!roomId.trim()) {
      toast({ title: "Room ID required", description: "Please enter or generate a room ID.", variant: "destructive" });
      return;
    }

    try {
      const trimmedRoom = roomId.trim();
      const joinRes = await joinRoom.mutateAsync({ data: { name: name.trim(), role, roomId: trimmedRoom } }) as {
        userId: string; streamToken: string | null;
      };

      const clientId = role === "client" ? joinRes.userId : undefined;
      const freelancerId = role === "freelancer" ? joinRes.userId : undefined;
      await createRoom.mutateAsync({
        data: {
          roomId: trimmedRoom,
          clientId: clientId ?? `client-placeholder-${trimmedRoom}`,
          freelancerId: freelancerId ?? null,
        },
      });

      setUser({
        userId: joinRes.userId,
        userName: name.trim(),
        role,
        streamToken: joinRes.streamToken ?? null,
        roomId: roomId.trim(),
      });

      setLocation(`/room/${roomId.trim()}`);
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  const isLoading = joinRoom.isPending || createRoom.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Vaultalk</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            AI-witnessed contract negotiation with StreamPay escrow. Freelancers and clients agree in real time.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Feature label="Real-time chat" />
            <span className="w-px h-3 bg-border" />
            <Feature label="AI extraction" />
            <span className="w-px h-3 bg-border" />
            <Feature label="StreamPay escrow" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Your name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed Al-Rashid"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              data-testid="input-name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Your role</Label>
            <div className="grid grid-cols-2 gap-2">
              <RoleButton
                active={role === "client"}
                onClick={() => setRole("client")}
                label="Client"
                description="Hiring & paying"
                testId="button-role-client"
              />
              <RoleButton
                active={role === "freelancer"}
                onClick={() => setRole("freelancer")}
                label="Freelancer"
                description="Delivering work"
                testId="button-role-freelancer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roomId" className="text-sm font-medium">
              Room ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. vault-1234"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm"
                data-testid="input-room-id"
                onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRoomId(randomRoomId())}
                className="flex-shrink-0 border-border text-muted-foreground hover:text-foreground"
                title="Generate random room ID"
                data-testid="button-generate-room-id"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Share this ID with the other party to join the same room.
            </p>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 glow-purple"
            onClick={handleEnter}
            disabled={isLoading}
            data-testid="button-enter-room"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Entering room...
              </>
            ) : (
              <>
                Enter negotiation room
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Powered by Replit AI · StreamPay · Stream Chat</span>
        </div>
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="w-1 h-1 rounded-full bg-primary" />
      {label}
    </span>
  );
}

function RoleButton({
  active, onClick, label, description, testId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary text-muted-foreground hover:border-border/80 hover:text-foreground"
      }`}
      data-testid={testId}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[11px] opacity-70">{description}</p>
    </button>
  );
}
