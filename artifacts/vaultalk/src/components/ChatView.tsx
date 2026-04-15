import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Wifi, WifiOff } from "lucide-react";
import type { UserData } from "@/contexts/UserContext";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  role: "client" | "freelancer" | "system";
  text: string;
  timestamp: Date;
}

interface ChatViewProps {
  roomId: string;
  user: UserData;
  onMessagesUpdate: (messages: string[]) => void;
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

export default function ChatView({ roomId, user, onMessagesUpdate }: ChatViewProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamConnected, setStreamConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [channelRef, setChannelRef] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    onMessagesUpdate(
      messages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.userName} (${m.role}): ${m.text}`)
    );
  }, [messages, onMessagesUpdate]);

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
        const state = await channel.watch();
        if (cancelled) return;

        setChannelRef(channel);
        setStreamConnected(true);

        const existing = (state.messages ?? []).map(
          (m): ChatMessage => ({
            id: m.id,
            userId: m.user?.id ?? "unknown",
            userName: m.user?.name ?? "Unknown",
            role: (m.user?.id?.endsWith("_client") ? "client" : "freelancer") as
              | "client"
              | "freelancer",
            text: m.text ?? "",
            timestamp: new Date(m.created_at ?? Date.now()),
          })
        );
        setMessages(existing);

        const { unsubscribe } = channel.on("message.new", (event) => {
          if (!event.message) return;
          const msg: ChatMessage = {
            id: event.message.id,
            userId: event.message.user?.id ?? "unknown",
            userName: event.message.user?.name ?? "Unknown",
            role: (event.message.user?.id?.endsWith("_client")
              ? "client"
              : "freelancer") as "client" | "freelancer",
            text: event.message.text ?? "",
            timestamp: new Date(event.message.created_at ?? Date.now()),
          };
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
        <div className="flex gap-2 items-end">
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
          · Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
