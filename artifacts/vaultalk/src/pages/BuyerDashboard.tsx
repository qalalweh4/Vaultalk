import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck, LogOut, RefreshCw, MessageSquare,
  Clock, CheckCircle, AlertCircle, Plus, X, ArrowRight, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RoomInfo {
  roomId: string;
  counterpartName: string;
  counterpartUsername: string;
  description: string;
  amount: number | null;
  currency: string;
  escrowStatus: "empty" | "locked" | "released" | "disputed";
  createdAt: string;
}

function escrowBadge(status: string) {
  switch (status) {
    case "locked":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 border text-[11px]">
          <Clock className="w-2.5 h-2.5 mr-1" /> Escrow locked
        </Badge>
      );
    case "released":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border text-[11px]">
          <CheckCircle className="w-2.5 h-2.5 mr-1" /> Paid
        </Badge>
      );
    case "disputed":
      return (
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 border text-[11px]">
          <AlertCircle className="w-2.5 h-2.5 mr-1" /> Disputed
        </Badge>
      );
    default:
      return (
        <Badge className="bg-secondary text-muted-foreground border-border border text-[11px]">
          Negotiating
        </Badge>
      );
  }
}

export default function BuyerDashboard() {
  const [, setLocation] = useLocation();
  const { account, logout } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  // New request form
  const [sellerUsername, setSellerUsername] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRooms = useCallback(async () => {
    if (!account) return;
    try {
      const res = await fetch("/api/user/rooms", {
        headers: { Authorization: `Bearer ${account.token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { rooms: RoomInfo[] };
        setRooms(data.rooms);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (!account) {
      setLocation("/auth");
      return;
    }
    if (account.role !== "buyer") {
      setLocation("/dashboard");
      return;
    }
    fetchRooms();
    const iv = setInterval(fetchRooms, 10000);
    return () => clearInterval(iv);
  }, [account, setLocation, fetchRooms]);

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  const handleCreateRoom = async () => {
    if (!sellerUsername.trim()) {
      toast({ title: "Seller username required", variant: "destructive" });
      return;
    }
    if (!account) return;
    setCreating(true);
    try {
      const res = await fetch("/api/rooms/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.token}`,
        },
        body: JSON.stringify({
          sellerUsername: sellerUsername.trim(),
          description: description.trim(),
          amount: amount ? Number(amount) : undefined,
          currency: "SAR",
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create room");
      }
      const data = (await res.json()) as { roomId: string };
      toast({ title: "Room created!", description: "Redirecting to chat…" });
      setLocation(`/room/${data.roomId}`);
    } catch (err) {
      toast({
        title: "Could not create room",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!account) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">Vaultalk</span>
          <span className="text-border mx-1">|</span>
          <Badge className="bg-primary/10 text-primary border-primary/20 border text-[11px]">
            Buyer
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{account.displayName}</span>
            <span className="font-mono text-xs ml-1 opacity-60">@{account.username}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Your Negotiations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Open a new room with any seller to start negotiating.
            </p>
          </div>
          <Button
            onClick={() => setShowNew((v) => !v)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            size="sm"
          >
            {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showNew ? "Cancel" : "Pay a Seller"}
          </Button>
        </div>

        {/* New room form */}
        {showNew && (
          <div className="mb-6 bg-card border border-primary/30 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm">Start a new negotiation</h2>
            <div className="space-y-1.5">
              <Label className="text-sm">Seller username</Label>
              <Input
                value={sellerUsername}
                onChange={(e) => setSellerUsername(e.target.value)}
                placeholder="e.g. sara_designs"
                className="bg-input border-border font-mono text-sm"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Ask the seller for their Vaultalk username.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">What do you need? (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Logo design for my brand"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Your budget in SAR (optional)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={creating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Opening room…
                </>
              ) : (
                <>
                  Open Negotiation Room <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Rooms list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading rooms…</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No active negotiations.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Click "Pay a Seller" above to start one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-400">
                    {room.counterpartName[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{room.counterpartName}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      @{room.counterpartUsername}
                    </span>
                    {escrowBadge(room.escrowStatus)}
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {room.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {room.amount !== null && (
                      <span className="text-xs font-semibold text-emerald-400">
                        {room.amount.toLocaleString()} {room.currency}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setLocation(`/room/${room.roomId}`)}
                  className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Chat
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
