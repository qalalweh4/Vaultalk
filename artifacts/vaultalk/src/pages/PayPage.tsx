import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function PayPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { account } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "creating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const params = new URLSearchParams(search);
  const sellerUsername = params.get("seller") ?? "";
  const amount = params.get("amount") ?? "";
  const currency = params.get("currency") ?? "SAR";
  const description = params.get("description") ?? "";

  useEffect(() => {
    if (!sellerUsername) {
      setLocation("/dashboard");
      return;
    }
    // Not logged in → go to auth, come back after
    if (!account) {
      setLocation(`/auth`);
      return;
    }
    // Seller landed on pay page — wrong role
    if (account.role === "seller") {
      setErrorMsg("This link is for buyers only. Sign in with a buyer account.");
      setStatus("error");
      return;
    }
    // Buyer — auto-create room
    createRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const createRoom = async () => {
    if (!account || account.role !== "buyer") return;
    setStatus("creating");
    try {
      const res = await fetch("/api/rooms/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.token}`,
        },
        body: JSON.stringify({
          sellerUsername,
          description,
          amount: amount ? Number(amount) : undefined,
          currency,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Could not create room");
      }
      const data = (await res.json()) as { roomId: string };
      toast({ title: "Room opened!", description: "Connecting you to the seller…" });
      setLocation(`/room/${data.roomId}`);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">Couldn't open room</h2>
          <p className="text-muted-foreground text-sm mb-6">{errorMsg}</p>
          <Button onClick={() => setLocation("/auth")} variant="outline">
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="font-bold text-xl mb-2">Opening negotiation room…</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Setting up your room with{" "}
          <span className="text-foreground font-medium">@{sellerUsername}</span>
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mb-4 italic">"{description}"</p>
        )}
        {amount && (
          <p className="text-sm font-semibold text-emerald-400 mb-4">
            Budget: {Number(amount).toLocaleString()} {currency}
          </p>
        )}
        <RefreshCw className="w-5 h-5 animate-spin text-primary mx-auto" />
      </div>
    </div>
  );
}
