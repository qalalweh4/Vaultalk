import { useState, useEffect, useCallback, useRef } from "react";
import { useGenerateContract, useReleasePayment, useGetRoom, getGetRoomQueryKey, type RoomStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, DollarSign, Calendar, RefreshCw, CheckCircle,
  AlertCircle, Loader2, FileCheck, Unlock, XCircle,
} from "lucide-react";
import ContractModal from "@/components/ContractModal";
import SendContractModal from "@/components/SendContractModal";
import type { UserData } from "@/contexts/UserContext";

interface ContractTerms {
  price?: number | null;
  currency?: string | null;
  deliverables?: string[] | null;
  deadline?: string | null;
  revisions?: number | null;
  status?: string | null;
  confidence?: number | null;
  summary?: string | null;
}

interface TermsPanelProps {
  roomId: string;
  user: UserData;
  messages: string[];
}

export default function TermsPanel({ roomId, user, messages }: TermsPanelProps) {
  const { toast } = useToast();
  const [terms, setTerms] = useState<ContractTerms | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [contractOpen, setContractOpen] = useState(false);
  const [sendContractOpen, setSendContractOpen] = useState(false);

  const generateContract = useGenerateContract();
  const releasePayment = useReleasePayment();

  // Poll room for escrow status so webhook-triggered releases appear automatically
  const { data: roomData } = useGetRoom(roomId, {
    query: {
      queryKey: getGetRoomQueryKey(roomId),
      refetchInterval: 10000,
    },
  });
  const escrowStatus: string = (roomData as RoomStatus | undefined)?.escrow?.status ?? "empty";

  // Keep a ref to messages so the interval always uses the latest without re-registering
  const messagesRef = useRef<string[]>(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const poll = useCallback(() => {
    if (messagesRef.current.length === 0) return;
    generateContract.mutate(
      { data: { roomId, messages: messagesRef.current } },
      {
        onSuccess: (res) => {
          const r = res as { terms?: ContractTerms };
          if (r?.terms) setTerms(r.terms);
          setLastPolled(new Date());
        },
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    // Initial poll after 3s (let chat load first), then every 20s
    const initial = setTimeout(poll, 3000);
    const id = setInterval(poll, 20000);
    return () => { clearTimeout(initial); clearInterval(id); };
  }, [poll]);

  const handleRelease = () => {
    releasePayment.mutate(
      { data: { roomId } },
      {
        onSuccess: () => {
          toast({ title: "Payment released", description: "Funds have been released to the freelancer." });
          setSendContractOpen(true);
        },
        onError: () => {
          toast({ title: "Release failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const agreed = terms?.status === "agreed";
  const statusColor = agreed
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : terms?.status === "negotiating"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-muted text-muted-foreground border-border";

  return (
    <aside className="flex flex-col h-full bg-card border-l border-border" data-testid="panel-terms">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Live Contract Terms</span>
        </div>
        <div className="flex items-center gap-2">
          {generateContract.isPending && (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
          {lastPolled && (
            <span className="text-[10px] text-muted-foreground">
              {lastPolled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!terms && !generateContract.isPending && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">AI will extract contract terms as you negotiate.</p>
          </div>
        )}

        {terms && (
          <>
            {terms.status && (
              <Badge className={`text-xs font-medium border ${statusColor}`} data-testid="badge-terms-status">
                {agreed ? "Agreement reached" :
                 terms.status === "negotiating" ? "In negotiation" :
                 terms.status}
              </Badge>
            )}

            {terms.summary && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2 leading-relaxed" data-testid="text-terms-summary">
                {terms.summary}
              </p>
            )}

            <Separator className="bg-border" />

            <div className="space-y-3">
              {terms.price !== null && terms.price !== undefined && (
                <TermRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Payment" testId="text-terms-price">
                  <span className="font-semibold">{terms.price} {terms.currency ?? ""}</span>
                </TermRow>
              )}
              {terms.deadline && (
                <TermRow icon={<Calendar className="w-3.5 h-3.5" />} label="Deadline" testId="text-terms-deadline">
                  {terms.deadline}
                </TermRow>
              )}
              {terms.revisions !== null && terms.revisions !== undefined && (
                <TermRow icon={<RefreshCw className="w-3.5 h-3.5" />} label="Revisions" testId="text-terms-revisions">
                  {terms.revisions} included
                </TermRow>
              )}
              {terms.deliverables && terms.deliverables.length > 0 && (
                <TermRow icon={<CheckCircle className="w-3.5 h-3.5" />} label="Deliverables" testId="text-terms-deliverables">
                  <ul className="space-y-0.5">
                    {terms.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-primary">·</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </TermRow>
              )}
            </div>

            {agreed && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Agreement detected
                </div>
                <p className="text-xs text-emerald-400/80">
                  Both parties appear to have agreed. Use <kbd className="bg-emerald-900/30 px-1 rounded text-[10px]">/agree</kbd> to confirm.
                </p>
              </div>
            )}

            {!terms.price && !terms.deadline && !terms.deliverables?.length && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                No concrete terms yet
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={() => setContractOpen(true)}
          data-testid="button-view-contract"
        >
          <FileCheck className="w-4 h-4" />
          View Full Contract
        </Button>

        {user.role === "client" && escrowStatus === "released" && (
          <div
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            data-testid="badge-escrow-released"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Payment released via StreamPay
          </div>
        )}

        {user.role === "client" && escrowStatus === "disputed" && (
          <div
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
            data-testid="badge-escrow-disputed"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            Payment failed — funds frozen
          </div>
        )}

        {user.role === "client" && escrowStatus === "locked" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-2"
            onClick={handleRelease}
            disabled={releasePayment.isPending}
            data-testid="button-release-payment"
          >
            <Unlock className="w-4 h-4" />
            {releasePayment.isPending ? "Releasing..." : "Release Payment"}
          </Button>
        )}
      </div>

      <ContractModal
        open={contractOpen}
        onClose={() => setContractOpen(false)}
        terms={terms}
        roomId={roomId}
        user={user}
      />

      <SendContractModal
        open={sendContractOpen}
        onClose={() => setSendContractOpen(false)}
        roomId={roomId}
        user={user}
        terms={terms}
        clientName={user.role === "client" ? user.userName : "Client"}
        merchantName={user.role === "freelancer" ? user.userName : "Merchant"}
      />
    </aside>
  );
}

function TermRow({
  icon, label, children, testId,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="flex items-start gap-2" data-testid={testId}>
      <span className="text-primary mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
        <div className="text-xs text-foreground">{children}</div>
      </div>
    </div>
  );
}
