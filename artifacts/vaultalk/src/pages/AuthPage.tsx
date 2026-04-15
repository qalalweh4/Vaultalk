import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "login" | "register";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    if (mode === "register" && !displayName.trim()) {
      toast({ title: "Display name required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, role, displayName.trim());
      }
      setLocation("/dashboard");
    } catch (err) {
      toast({
        title: mode === "login" ? "Login failed" : "Registration failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Vaultalk</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            AI-witnessed contract negotiation with StreamPay escrow.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-5">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 bg-secondary rounded-lg p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Role picker (register only) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">I am a…</Label>
              <div className="grid grid-cols-2 gap-2">
                <RoleCard
                  active={role === "buyer"}
                  onClick={() => setRole("buyer")}
                  emoji="🛒"
                  label="Buyer"
                  description="I hire & pay"
                />
                <RoleCard
                  active={role === "seller"}
                  onClick={() => setRole("seller")}
                  emoji="🎨"
                  label="Seller"
                  description="I deliver work"
                />
              </div>
            </div>
          )}

          {/* Display name (register only) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ahmed Al-Rashid"
                className="bg-input border-border"
                autoFocus
              />
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ahmed_designs"
              className="bg-input border-border font-mono text-sm"
              autoFocus={mode === "login"}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-input border-border"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </>
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Powered by Claude AI · StreamPay · Stream Chat</span>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  emoji,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary text-muted-foreground hover:border-border/80 hover:text-foreground"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <p className="text-sm font-semibold mt-1">{label}</p>
      <p className="text-[11px] opacity-70">{description}</p>
    </button>
  );
}
