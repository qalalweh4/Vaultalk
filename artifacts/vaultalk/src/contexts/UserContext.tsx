import { createContext, useContext, useState, type ReactNode } from "react";

export interface UserData {
  userId: string;
  userName: string;
  role: "client" | "freelancer";
  streamToken: string | null;
  roomId: string;
}

interface UserContextValue {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
