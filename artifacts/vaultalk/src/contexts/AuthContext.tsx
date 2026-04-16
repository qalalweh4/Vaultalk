import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthAccount {
  userId: string;
  username: string;
  role: "buyer" | "seller" | "freelancer";
  displayName: string;
  token: string;
  streamToken: string;
}

interface AuthContextValue {
  account: AuthAccount | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    role: "buyer" | "seller" | "freelancer",
    displayName: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  account: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const STORAGE_KEY = "vaultalk_account_v1";

function load(): AuthAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthAccount) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AuthAccount | null>(load);

  const persist = (acc: AuthAccount | null) => {
    setAccount(acc);
    if (acc) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(acc));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Login failed");
    }
    persist((await res.json()) as AuthAccount);
  };

  const register = async (
    username: string,
    password: string,
    role: "buyer" | "seller" | "freelancer",
    displayName: string,
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password, role, displayName: displayName.trim() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Registration failed");
    }
    persist((await res.json()) as AuthAccount);
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ account, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
