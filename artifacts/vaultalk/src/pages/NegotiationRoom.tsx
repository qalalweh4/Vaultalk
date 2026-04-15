import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useUser } from "@/contexts/UserContext";
import ChatView from "@/components/ChatView";
import TermsPanel from "@/components/TermsPanel";
import EscrowStatus from "@/components/EscrowStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Copy, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NegotiationRoom() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId ?? "";
  const [, setLocation] = useLocation();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleMessagesUpdate = useCallback((messages: string[]) => {
    setChatMessages(messages);
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      toast({ title: "Room ID copied", description: roomId });
    });
  };

  const handleLeave = () => {
    setUser(null);
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" data-testid="page-negotiation-room">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Vaultalk</span>
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
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
              data-testid="badge-user-role"
            >
              {user.role}
            </Badge>
            <span className="text-sm font-medium text-foreground" data-testid="text-user-name">
              {user.userName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={handleLeave}
            title="Leave room"
            data-testid="button-leave-room"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0" style={{ flex: "3 1 0%" }}>
          <ChatView roomId={roomId} user={user} onMessagesUpdate={handleMessagesUpdate} />
        </div>
        <div className="flex flex-col min-w-0 w-[340px] flex-shrink-0">
          <TermsPanel roomId={roomId} user={user} messages={chatMessages} />
        </div>
      </div>
    </div>
  );
}
