import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { UserData } from "@/contexts/UserContext";
import ChatView from "@/components/ChatView";
import TermsPanel from "@/components/TermsPanel";
import EscrowStatus from "@/components/EscrowStatus";
import GradientBackground from "@/components/GradientBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Copy, ArrowLeft, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NegotiationRoom() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId ?? "";
  const [, setLocation] = useLocation();
  const { account } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [deliverableRefresh, setDeliverableRefresh] = useState(0);

  useEffect(() => {
    if (!account) {
      setLocation("/auth");
    }
  }, [account, setLocation]);

  const handleMessagesUpdate = useCallback((messages: string[]) => {
    setChatMessages(messages);
  }, []);

  const handleDeliverableUploaded = useCallback(() => {
    setDeliverableRefresh((n) => n + 1);
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      toast({ title: "Room ID copied", description: roomId });
    });
  };

  const handleBack = () => {
    setLocation("/dashboard");
  };

  if (!account) return null;

  // Map account role to room participant role
  // buyer → client, seller → freelancer, freelancer → freelancer
  const roomRole: "client" | "freelancer" =
    account.role === "buyer" ? "client" : "freelancer";

  const user: UserData = {
    userId: account.userId,
    userName: account.displayName,
    role: roomRole,
    streamToken: account.streamToken,
    roomId,
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative" data-testid="page-negotiation-room">
      <GradientBackground />

      <header className="glass-card flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-card/70 flex-shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Vaultalk
            </span>
          </div>
          <span className="text-border">|</span>
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            onClick={handleCopyRoomId}
            data-testid="button-copy-room-id"
          >
            <span className="font-mono">{roomId}</span>
            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <EscrowStatus roomId={roomId} />

          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs font-medium border ${
                user.role === "client"
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/25"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
              data-testid="badge-user-role"
            >
              {account.role === "buyer" ? "Buyer" : account.role === "freelancer" ? "Freelancer" : "Seller"}
            </Badge>
            <span className="text-sm font-medium text-foreground" data-testid="text-user-name">
              {user.userName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={handleBack}
            title="Back to dashboard"
            data-testid="button-leave-room"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative z-10">
        <div className="flex flex-col flex-1 min-w-0" style={{ flex: "3 1 0%" }}>
          <ChatView
            roomId={roomId}
            user={user}
            onMessagesUpdate={handleMessagesUpdate}
            onDeliverableUploaded={handleDeliverableUploaded}
          />
        </div>
        <div className="flex flex-col min-w-0 w-[340px] flex-shrink-0">
          <TermsPanel
            roomId={roomId}
            user={user}
            messages={chatMessages}
            refreshDeliverables={deliverableRefresh}
          />
        </div>
      </div>
    </div>
  );
}
