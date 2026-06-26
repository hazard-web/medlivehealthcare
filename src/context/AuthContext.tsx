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
import { apiFetch, parseApiJson } from "@/lib/api";

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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Remove legacy browser-only auth/order data from before PostgreSQL. */
const LEGACY_STORAGE_KEYS = ["medlive_users", "medlive_session", "medlive_orders"];

async function fetchSessionUser(): Promise<User | null> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) return null;
  const data = await parseApiJson<{ user: User | null }>(res);
  return data.user ?? null;
}

function networkErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Could not reach the server. Check your connection and try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const sessionUser = await fetchSessionUser();
    setUser(sessionUser);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const signUp = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      try {
        const res = await apiFetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await parseApiJson<{ error?: string; user: User }>(res);
        if (!res.ok) {
          return { success: false, error: json.error || "Could not create account." };
        }
        setUser(json.user);
        return { success: true };
      } catch (error) {
        return { success: false, error: networkErrorMessage(error) };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiFetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await parseApiJson<{ error?: string; user: User }>(res);
      if (!res.ok) {
        return { success: false, error: json.error || "Invalid email or password." };
      }
      setUser(json.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: networkErrorMessage(error) };
    }
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    try {
      const res = await apiFetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await parseApiJson<{ error?: string; demoOtp?: string }>(res);
      if (!res.ok) return { success: false, error: json.error };
      return { success: true, demoOtp: json.demoOtp };
    } catch (error) {
      return { success: false, error: networkErrorMessage(error) };
    }
  }, []);

  const signInWithOtp = useCallback(async (phone: string, code: string, name?: string) => {
    try {
      const res = await apiFetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name }),
      });
      const json = await parseApiJson<{ error?: string; user: User }>(res);
      if (!res.ok) return { success: false, error: json.error };
      setUser(json.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: networkErrorMessage(error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiFetch("/api/auth/me", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...data } : current));
  }, []);

  const saveAddress = useCallback(
    async (address: SavedAddress, makeDefault = false) => {
      if (!user) return;

      const res = await apiFetch("/api/auth/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, makeDefault }),
      });
      const json = await parseApiJson<{ error?: string; user: User }>(res);
      if (!res.ok) {
        throw new Error(json.error || "Could not save address.");
      }
      setUser(json.user);
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
        refreshUser,
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
