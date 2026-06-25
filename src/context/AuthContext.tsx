"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, SavedAddress } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (
    phone: string,
    code: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string; demoOtp?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; demoOtp?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  saveAddress: (address: SavedAddress, makeDefault?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "medlive_users";
const SESSION_KEY = "medlive_session";

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function fetchSessionUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessionUser().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        setIsLoading(false);
        return;
      }

      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const users = getStoredUsers();
        const found = users.find((u) => u.id === sessionId);
        if (found) {
          const { password: _, ...userData } = found;
          setUser(userData);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const signUp = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error };

        setUser(json.user);
        localStorage.removeItem(SESSION_KEY);
        return { success: true };
      } catch {
        const users = getStoredUsers();
        if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
          return { success: false, error: "An account with this email already exists." };
        }
        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        };
        users.push(newUser);
        saveUsers(users);
        const { password: _, ...userData } = newUser;
        setUser(userData);
        localStorage.setItem(SESSION_KEY, newUser.id);
        return { success: true };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error };

      setUser(json.user);
      localStorage.removeItem(SESSION_KEY);
      return { success: true };
    } catch {
      const users = getStoredUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) return { success: false, error: "Invalid email or password." };
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem(SESSION_KEY, found.id);
      return { success: true };
    }
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error };
    return { success: true, demoOtp: json.demoOtp };
  }, []);

  const signInWithOtp = useCallback(async (phone: string, code: string, name?: string) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, code, name }),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error };
    setUser(json.user);
    localStorage.removeItem(SESSION_KEY);
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/me", { method: "DELETE", credentials: "include" });
    } catch {
      /* ignore */
    }
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser({ ...user, ...data });
        return;
      }
      const updated = { ...users[idx], ...data };
      users[idx] = updated;
      saveUsers(users);
      const { password: _, ...userData } = updated;
      setUser(userData);
    },
    [user]
  );

  const saveAddress = useCallback(
    async (address: SavedAddress, makeDefault = false) => {
      if (!user) return;

      const existing = user.savedAddresses ?? [];
      const withoutDup = existing.filter((item) => item.id !== address.id);
      const next = makeDefault || address.isDefault || withoutDup.length === 0;
      const saved: SavedAddress = { ...address, isDefault: next };
      const merged = [
        ...withoutDup.map((item) => ({ ...item, isDefault: next ? false : item.isDefault })),
        saved,
      ];

      setUser({ ...user, savedAddresses: merged, phone: saved.phone });

      try {
        await fetch("/api/auth/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ address: saved, makeDefault }),
        });
      } catch {
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx === -1) return;
        users[idx] = { ...users[idx], savedAddresses: merged, phone: saved.phone };
        saveUsers(users);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signInWithOtp,
        sendOtp,
        signOut,
        updateProfile,
        saveAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
