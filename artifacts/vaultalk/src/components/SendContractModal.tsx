import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSendContractToChat } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { FileText, Languages, CheckCircle, Loader2 } from "lucide-react";
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
  const [language, setLanguage] = useState<"en" | "ar" | null>(null);
  const [sent, setSent] = useState(false);

  const sendToChat = useSendContractToChat();

  const handleSend = () => {
    if (!language || !terms) return;

    sendToChat.mutate(
      {
        data: {
          roomId,
          language,
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
        },
      },
      {
        onSuccess: () => {
          setSent(true);
          toast({
            title: language === "ar" ? "تم إرسال العقد" : "Contract sent",
            description:
              language === "ar"
                ? "تم إرسال العقد الرسمي إلى المحادثة."
                : "The signed contract has been posted to the chat.",
          });
          setTimeout(() => {
            onClose();
            setSent(false);
            setLanguage(null);
          }, 1500);
        },
        onError: () => {
          toast({
            title: "Failed to send",
            description: "Could not send the contract to chat. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClose = () => {
    if (!sendToChat.isPending) {
      onClose();
      setSent(false);
      setLanguage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="w-4 h-4 text-primary" />
            Send Contract to Chat
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            The signed contract will be posted as a message visible to both parties.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-emerald-400">
            <CheckCircle className="w-10 h-10" />
            <p className="text-sm font-medium">
              {language === "ar" ? "تم إرسال العقد بنجاح!" : "Contract sent successfully!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="w-4 h-4" />
              <span>Choose contract language:</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage("en")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all ${
                  language === "en"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="text-xl">🇬🇧</span>
                <span>English</span>
              </button>

              <button
                onClick={() => setLanguage("ar")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all ${
                  language === "ar"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="text-xl">🇸🇦</span>
                <span>العربية</span>
              </button>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleSend}
              disabled={!language || sendToChat.isPending}
            >
              {sendToChat.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  {language === "ar" ? "إرسال العقد إلى المحادثة" : "Send Contract to Chat"}
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={handleClose}
              disabled={sendToChat.isPending}
            >
              Maybe later
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
