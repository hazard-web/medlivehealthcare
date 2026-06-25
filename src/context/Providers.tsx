"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { ChatProvider } from "./ChatContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>{children}</ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}
