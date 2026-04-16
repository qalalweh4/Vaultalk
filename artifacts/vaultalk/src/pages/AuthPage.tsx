import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ShieldCheck, Sparkles, ArrowRight, RefreshCw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import GradientBackground from "@/components/GradientBackground";

type Mode = "login" | "register";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const nextUrl = new URLSearchParams(search).get("next") ?? "/dashboard";
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      setLocation(nextUrl);
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      <GradientBackground />

      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9 glass-card bg-card/50 border border-border/60 text-muted-foreground hover:text-foreground"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg glow-purple">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              Vaultalk
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            AI-witnessed contract negotiation with StreamPay escrow.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card bg-card/75 border border-border/60 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 bg-secondary/60 rounded-xl p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  mode === m
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
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
                className="bg-input/60 border-border"
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
              className="bg-input/60 border-border font-mono text-sm"
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
              className="bg-input/60 border-border"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold gap-2 shadow-sm"
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
          <Sparkles className="w-3 h-3 text-purple-400" />
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
      className={`p-3 rounded-xl border text-left transition-all duration-150 ${
        active
          ? "border-purple-500/50 bg-gradient-to-br from-purple-500/15 to-pink-500/10 text-purple-300"
          : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80 hover:text-foreground"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <p className="text-sm font-semibold mt-1">{label}</p>
      <p className="text-[11px] opacity-70">{description}</p>
    </button>
  );
}
