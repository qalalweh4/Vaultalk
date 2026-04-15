import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown, CheckCircle, Loader2 } from "lucide-react";
import type { UserData } from "@/contexts/UserContext";

interface ContractTerms {
  price?: number | null;
  currency?: string | null;
  deliverables?: string[] | null;
  deadline?: string | null;
  revisions?: number | null;
  status?: string | null;
}

interface SendContractModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  user: UserData;
  terms: ContractTerms | null;
  clientName: string;
  freelancerName: string;
}

export default function SendContractModal({
  open,
  onClose,
  roomId,
  user,
  terms,
  clientName,
  freelancerName,
}: SendContractModalProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!terms) return;

    setDownloading(true);
    try {
      const response = await fetch(`/api/contract/download-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          clientName,
          freelancerName,
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

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaultalk-contract-${roomId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      toast({
        title: "Contract downloaded",
        description: "The bilingual PDF contract has been saved to your device.",
      });

      setTimeout(() => {
        onClose();
        setDownloaded(false);
      }, 2000);
    } catch {
      toast({
        title: "Download failed",
        description: "Could not generate the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    if (!downloading) {
      onClose();
      setDownloaded(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileDown className="w-4 h-4 text-primary" />
            Download Contract PDF
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Download the signed contract as a bilingual PDF (English + Arabic).
          </DialogDescription>
        </DialogHeader>

        {downloaded ? (
          <div className="flex flex-col items-center gap-3 py-6 text-emerald-400">
            <CheckCircle className="w-10 h-10" />
            <p className="text-sm font-medium">Contract downloaded successfully!</p>
          </div>
        ) : (
          <div className="space-y-4 mt-1">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">What's included</p>
              <ul className="text-sm text-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-primary">·</span>
                  <span>English contract (left-to-right)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">·</span>
                  <span>Arabic contract / عقد بالعربية (right-to-left)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">·</span>
                  <span>AI witness certificate</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleDownload}
              disabled={!terms || downloading}
              data-testid="button-download-pdf"
            >
              {downloading ? (
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

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={handleClose}
              disabled={downloading}
            >
              Maybe later
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
