import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLockPayment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Lock, ExternalLink, FileText, FileDown, DollarSign, Calendar, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
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

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  terms: ContractTerms | null;
  roomId: string;
  user: UserData;
}

export default function ContractModal({ open, onClose, terms, roomId, user }: ContractModalProps) {
  const { toast } = useToast();
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const lockPayment = useLockPayment();

  const handleDownloadPdf = async () => {
    if (!terms) return;
    setDownloadingPdf(true);
    try {
      const response = await fetch("/api/contract/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          clientName: user.role === "client" ? user.userName : "Client",
          freelancerName: user.role === "freelancer" ? user.userName : "Freelancer",
          terms: {
            price: terms.price ?? null,
            currency: terms.currency ?? "SAR",
            deliverables: terms.deliverables ?? [],
            deadline: terms.deadline ?? null,
            revisions: terms.revisions ?? null,
            status: (terms.status as "negotiating" | "near-agreement" | "agreed") ?? "agreed",
          },
        }),
      });
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaultalk-contract-${roomId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Contract downloaded", description: "Bilingual PDF saved to your device." });
    } catch {
      toast({ title: "Download failed", description: "Could not generate the PDF.", variant: "destructive" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLockPayment = () => {
    if (!terms?.price || !terms?.currency) {
      toast({ title: "Missing terms", description: "Price and currency must be agreed before locking escrow.", variant: "destructive" });
      return;
    }
    lockPayment.mutate(
      {
        data: {
          roomId,
          amount: terms.price,
          currency: terms.currency,
          clientId: user.role === "client" ? user.userId : `client-${roomId}`,
          freelancerId: user.role === "freelancer" ? user.userId : `freelancer-${roomId}`,
          description: `Vaultalk escrow — Room ${roomId}`,
        },
      },
      {
        onSuccess: (res) => {
          const link = (res as { paymentLinkUrl?: string }).paymentLinkUrl ?? null;
          setPaymentLink(link);
          setLocked(true);
          toast({ title: "Escrow locked", description: link ? "Click the StreamPay link to fund the escrow." : "Escrow record created." });
        },
        onError: () => {
          toast({ title: "Failed to lock escrow", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (!terms) return null;

  const confidencePct = terms.confidence ? Math.round(terms.confidence * 100) : null;
  const statusColor =
    terms.status === "agreed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    terms.status === "negotiating" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
    "bg-muted text-muted-foreground border-border";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border text-foreground" data-testid="modal-contract">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="w-5 h-5 text-primary" />
            AI-Extracted Contract
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {terms.status && (
            <div className="flex items-center justify-between">
              <Badge className={`text-xs font-medium border ${statusColor}`} data-testid="badge-contract-status">
                {terms.status === "agreed" ? "Both Agreed" :
                 terms.status === "negotiating" ? "Still Negotiating" :
                 terms.status}
              </Badge>
              {confidencePct !== null && (
                <span className="text-xs text-muted-foreground">
                  AI confidence: <span className="text-foreground font-medium">{confidencePct}%</span>
                </span>
              )}
            </div>
          )}

          {terms.summary && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/40 pl-3">
              {terms.summary}
            </p>
          )}

          <Separator className="bg-border" />

          <div className="grid gap-3">
            {terms.price !== null && terms.price !== undefined && (
              <div className="flex items-start gap-3" data-testid="text-contract-price">
                <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="text-sm font-semibold">
                    {terms.price} {terms.currency ?? ""}
                  </p>
                </div>
              </div>
            )}

            {terms.deadline && (
              <div className="flex items-start gap-3" data-testid="text-contract-deadline">
                <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-semibold">{terms.deadline}</p>
                </div>
              </div>
            )}

            {terms.revisions !== null && terms.revisions !== undefined && (
              <div className="flex items-start gap-3" data-testid="text-contract-revisions">
                <RefreshCw className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Revisions</p>
                  <p className="text-sm font-semibold">{terms.revisions} included</p>
                </div>
              </div>
            )}

            {terms.deliverables && terms.deliverables.length > 0 && (
              <div className="flex items-start gap-3" data-testid="text-contract-deliverables">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deliverables</p>
                  <ul className="space-y-1">
                    {terms.deliverables.map((d, i) => (
                      <li key={i} className="text-sm flex items-start gap-1.5">
                        <span className="text-primary mt-1">·</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!terms.price && !terms.deadline && !terms.deliverables?.length && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>No concrete terms extracted yet. Keep negotiating.</span>
              </div>
            )}
          </div>

          <Separator className="bg-border" />

          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary/40 text-primary hover:bg-primary/10 gap-2"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            data-testid="button-download-contract-pdf"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Download Bilingual PDF
              </>
            )}
          </Button>

          <Separator className="bg-border" />

          {locked && paymentLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Escrow locked via StreamPay</span>
              </div>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
                data-testid="link-streampay-fund"
              >
                <ExternalLink className="w-4 h-4" />
                Fund Escrow on StreamPay
              </a>
            </div>
          ) : locked ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Escrow locked (demo mode — no StreamPay link)</span>
            </div>
          ) : user.role === "client" ? (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleLockPayment}
              disabled={lockPayment.isPending}
              data-testid="button-lock-payment"
            >
              <Lock className="w-4 h-4" />
              {lockPayment.isPending ? "Locking..." : "Lock Payment in Escrow (StreamPay)"}
            </Button>
          ) : (
            <p className="text-xs text-center text-muted-foreground">
              Waiting for the client to lock payment in escrow.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
