import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Wifi, WifiOff, Paperclip, Lock, FileDown, CheckCircle2, Loader2 } from "lucide-react";
import type { UserData } from "@/contexts/UserContext";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  role: "client" | "freelancer" | "system";
  text: string;
  timestamp: Date;
  isFile?: boolean;
  fileName?: string;
  fileUrl?: string;
}

interface ChatViewProps {
  roomId: string;
  user: UserData;
  onMessagesUpdate: (messages: string[]) => void;
  onDeliverableUploaded?: () => void;
}

function buildSystemMsg(text: string): ChatMessage {
  return {
    id: `sys-${Date.now()}-${Math.random()}`,
    userId: "system",
    userName: "System",
    role: "system",
    text,
    timestamp: new Date(),
  };
}

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY as string | undefined;
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export default function ChatView({ roomId, user, onMessagesUpdate, onDeliverableUploaded }: ChatViewProps) {
  const { toast } = useToast();
  const { account } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [streamConnected, setStreamConnected] = useState(false);
  const [isEscrowReleased, setIsEscrowReleased] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [channelRef, setChannelRef] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFreelancer = user.role === "freelancer";

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onMessagesUpdate(
      messages
        .filter((m) => m.role !== "system" && !m.isFile)
        .map((m) => `${m.userName} (${m.role}): ${m.text}`)
    );
  }, [messages, onMessagesUpdate]);

  // Poll escrow status so file messages can unlock for client after payment
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          const status = data?.escrow?.status;
          if (status === "released") setIsEscrowReleased(true);
        }
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [roomId]);

  useEffect(() => {
    if (!STREAM_API_KEY || !user.streamToken) {
      addMessage(
        buildSystemMsg(
          "Demo mode — messages are local to this browser tab. Configure Stream API key for real-time multi-user chat."
        )
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { StreamChat } = await import("stream-chat");
        const chatClient = StreamChat.getInstance(STREAM_API_KEY);
        clientRef.current = chatClient;
        await chatClient.connectUser({ id: user.userId, name: user.userName }, user.streamToken!);
        if (cancelled) return;

        const channel = chatClient.channel("messaging", roomId);

        let state: Awaited<ReturnType<typeof channel.watch>> | null = null;
        for (let attempt = 0; attempt < 10; attempt++) {
          if (cancelled) return;
          try {
            state = await channel.watch();
            break;
          } catch {
            if (attempt < 9) {
              await new Promise((r) => setTimeout(r, 3000));
            } else {
              throw new Error("Channel not available after 30s");
            }
          }
        }
        if (!state || cancelled) return;

        setChannelRef(channel);
        setStreamConnected(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAllowedForMe = (m: any) =>
          !(m?.client_only === true) || user.role === "client";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parseMsg = (m: any): ChatMessage => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isFile = (m as any).freelancer_file === true;
          return {
            id: m.id,
            userId: m.user?.id ?? "unknown",
            userName: m.user?.name ?? "Unknown",
            role: (m.user?.id?.endsWith("_client") ? "client" : "freelancer") as "client" | "freelancer",
            text: m.text ?? "",
            timestamp: new Date(m.created_at ?? Date.now()),
            isFile,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileName: (m as any).file_name ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileUrl: (m as any).file_url ?? undefined,
          };
        };

        const existing = (state.messages ?? [])
          .filter((m) => isAllowedForMe(m))
          .map(parseMsg);
        setMessages(existing);

        const { unsubscribe } = channel.on("message.new", (event) => {
          if (!event.message) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((event.message as any).client_only === true && user.role !== "client") return;
          const msg = parseMsg(event.message);
          setMessages((prev) => {
            if (prev.some((p) => p.id === msg.id)) return prev;
            return [...prev, msg];
          });
        });

        cleanupRef.current = unsubscribe;
      } catch (err) {
        console.error("Stream chat error", err);
        if (!cancelled) {
          addMessage(buildSystemMsg("Could not connect to Stream Chat. Running in demo mode."));
        }
      }
    })();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(() => {});
        clientRef.current = null;
      }
      setStreamConnected(false);
      setChannelRef(null);
    };
  }, [roomId, user.userId, user.userName, user.streamToken, addMessage]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setInput("");

    if (streamConnected && channelRef) {
      try {
        await channelRef.sendMessage({ text });
      } catch {
        toast({ title: "Send failed", description: "Message not delivered.", variant: "destructive" });
        setInput(text);
      }
    } else {
      const local: ChatMessage = {
        id: `local-${Date.now()}`,
        userId: user.userId,
        userName: user.userName,
        role: user.role,
        text,
        timestamp: new Date(),
      };
      addMessage(local);
    }
    setSending(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      let fileUrl: string | null = null;

      // Upload via Stream Chat if connected
      if (streamConnected && channelRef) {
        const result = await channelRef.sendFile(file);
        fileUrl = result.file;
      }

      // Register with backend
      if (account?.token) {
        const regRes = await fetch(`${BASE}/api/rooms/${roomId}/deliverables`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${account.token}`,
          },
          body: JSON.stringify({ fileName: file.name, fileUrl: fileUrl ?? `demo://${file.name}` }),
        });
        if (!regRes.ok) {
          throw new Error("Failed to register deliverable");
        }
      }

      // Send a gated file message in Stream Chat
      if (streamConnected && channelRef) {
        await channelRef.sendMessage({
          text: `📎 ${file.name}`,
          freelancer_file: true,
          file_name: file.name,
          file_url: fileUrl ?? "",
        });
      } else {
        // Demo mode: add local message
        addMessage({
          id: `local-file-${Date.now()}`,
          userId: user.userId,
          userName: user.userName,
          role: user.role,
          text: `📎 ${file.name}`,
          timestamp: new Date(),
          isFile: true,
          fileName: file.name,
          fileUrl: fileUrl ?? undefined,
        });
      }

      onDeliverableUploaded?.();
      toast({ title: "File uploaded", description: `"${file.name}" delivered. Client will see it after payment.` });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="panel-chat">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Negotiation thread</span>
        {STREAM_API_KEY ? (
          streamConnected ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Wifi className="w-3 h-3" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              Connecting
            </span>
          )
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <WifiOff className="w-3 h-3" />
            Demo mode
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="list-messages">
        {messages.map((msg) => {
          if (msg.role === "system") {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full italic">
                  {msg.text}
                </span>
              </div>
            );
          }

          if (msg.isFile) {
            const isMe = msg.userId === user.userId;
            const canSeeFile = isFreelancer || isEscrowReleased || isMe;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                data-testid={`msg-${msg.id}`}
              >
                <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="text-xs font-medium text-foreground">{msg.userName}</span>
                  <Badge className="text-[10px] py-0 px-1.5 font-normal border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    freelancer
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {canSeeFile ? (
                  <div className="max-w-[80%] rounded-xl px-3 py-2.5 text-sm bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-300 truncate">{msg.fileName}</p>
                      {msg.fileUrl && msg.fileUrl !== "" && !msg.fileUrl.startsWith("demo://") ? (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-400 underline flex items-center gap-0.5 mt-0.5"
                        >
                          <FileDown className="w-3 h-3" />
                          Download file
                        </a>
                      ) : (
                        <p className="text-[10px] text-emerald-400/70 mt-0.5">
                          {isMe ? "Uploaded — awaiting client payment" : "Ready to download"}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-xl px-3 py-2.5 text-sm bg-muted/50 border border-border flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground/70 truncate">{msg.fileName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        🔒 Locked — pay to unlock this file
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          const isMe = msg.userId === user.userId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
              data-testid={`msg-${msg.id}`}
            >
              <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <span className="text-xs font-medium text-foreground">{msg.userName}</span>
                <Badge
                  className={`text-[10px] py-0 px-1.5 font-normal border ${
                    msg.role === "client"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {msg.role}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary text-foreground rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border flex-shrink-0">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />

        <div className="flex gap-2 items-end">
          {isFreelancer && (
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11 flex-shrink-0 border-border text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload deliverable file"
              data-testid="button-upload-file"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            </Button>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… Use /agree, /release, or /dispute"
            className="resize-none min-h-[44px] max-h-32 bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
            rows={1}
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 h-11 w-11 flex-shrink-0"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          <kbd className="bg-muted px-1 rounded">/agree</kbd>{" "}
          <kbd className="bg-muted px-1 rounded">/release</kbd>{" "}
          <kbd className="bg-muted px-1 rounded">/dispute</kbd>{" "}
          {isFreelancer && (
            <>
              · <span className="text-emerald-400/80">📎 Upload files to client</span>{" "}
            </>
          )}
          · Enter to send
        </p>
      </div>
    </div>
  );
}
