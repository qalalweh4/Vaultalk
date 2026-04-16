import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck, LogOut, RefreshCw, MessageSquare,
  Clock, CheckCircle, AlertCircle, Package,
  Sun, Moon, Banknote, Gavel, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import GradientBackground from "@/components/GradientBackground";

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
        <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 border text-[11px]">
          <Gavel className="w-2.5 h-2.5 mr-1" /> Negotiating
        </Badge>
      );
  }
}

function RoomCard({ room, onOpen }: { room: RoomInfo; onOpen: () => void }) {
  const initials = room.counterpartName[0]?.toUpperCase() ?? "?";
  return (
    <div className="glass-card bg-card/70 border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-violet-300">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{room.counterpartName}</span>
          <span className="text-xs text-muted-foreground font-mono">@{room.counterpartUsername}</span>
          {escrowBadge(room.escrowStatus)}
        </div>
        {room.description && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{room.description}</p>
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
        onClick={onOpen}
        className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 gap-1.5 shadow-sm"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Open Chat
      </Button>
    </div>
  );
}

export default function SellerDashboard() {
  const [, setLocation] = useLocation();
  const { account, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (!account) { setLocation("/auth"); return; }
    if (account.role !== "seller") { setLocation("/dashboard"); return; }
    fetchRooms();
    const iv = setInterval(fetchRooms, 10000);
    return () => clearInterval(iv);
  }, [account, setLocation, fetchRooms]);

  const handleLogout = () => { logout(); setLocation("/auth"); };

  if (!account) return null;

  const negotiating = rooms.filter((r) => r.escrowStatus !== "released");
  const paid = rooms.filter((r) => r.escrowStatus === "released");
  const sellerLink = `${window.location.origin}/vaultalk/pay?seller=${account.username}`;

  return (
    <div className="min-h-screen bg-background relative">
      <GradientBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass-card bg-card/60 border-b border-border/60 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Vaultalk
            </span>
            <span className="text-border mx-1">|</span>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border text-[11px]">
              Seller
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              <span className="text-foreground font-medium">{account.displayName}</span>
              <span className="font-mono text-xs ml-1 opacity-60">@{account.username}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
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

        {/* Body: sidebar + main */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar — Paid deals */}
          <aside className="w-72 flex-shrink-0 border-r border-border/60 glass-card bg-sidebar/50 flex flex-col">
            <div className="px-4 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold">Completed Deals</span>
                {paid.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">
                    {paid.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {paid.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-muted-foreground opacity-40" />
                  </div>
                  <p className="text-xs text-muted-foreground">No completed deals yet.</p>
                  <p className="text-[11px] text-muted-foreground opacity-60 mt-1">
                    Paid rooms will appear here.
                  </p>
                </div>
              ) : (
                paid.map((room) => (
                  <button
                    key={room.roomId}
                    onClick={() => setLocation(`/room/${room.roomId}`)}
                    className="w-full text-left glass-card bg-card/50 border border-emerald-500/15 rounded-xl p-3 hover:border-emerald-500/30 hover:bg-card/70 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-400">
                          {room.counterpartName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{room.counterpartName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          @{room.counterpartUsername}
                        </p>
                      </div>
                    </div>
                    {room.description && (
                      <p className="text-[11px] text-muted-foreground truncate mt-1">{room.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      {room.amount !== null ? (
                        <span className="text-xs font-semibold text-emerald-400">
                          {room.amount.toLocaleString()} {room.currency}
                        </span>
                      ) : <span />}
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border text-[10px] px-1.5">
                        <CheckCircle className="w-2 h-2 mr-0.5" /> Paid
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Share link at bottom of sidebar */}
            <div className="p-3 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Your seller link
              </p>
              <div className="flex items-center gap-1.5">
                <code className="text-[11px] text-primary font-mono bg-primary/10 px-2 py-1.5 rounded-lg flex-1 truncate">
                  {sellerLink}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-7 h-7 flex-shrink-0 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(sellerLink);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </aside>

          {/* Main — active negotiations */}
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Active Negotiations
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Buyers who want to work with you will appear here.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading rooms…</span>
                </div>
              ) : negotiating.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/15 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No active negotiations</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Share your seller link to get your first request.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {negotiating.map((room) => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      onOpen={() => setLocation(`/room/${room.roomId}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
