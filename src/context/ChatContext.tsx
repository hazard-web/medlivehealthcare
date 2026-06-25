"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import {
  ChatMessage,
  ChatOpenContext,
  getBotReply,
  initialMessages,
  newMessage,
} from "@/lib/chatbot";

interface ChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  context: ChatOpenContext | undefined;
  openChat: (context?: ChatOpenContext) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages());
  const [context, setContext] = useState<ChatOpenContext | undefined>();

  const openChat = useCallback((ctx?: ChatOpenContext) => {
    setContext(ctx);
    setMessages(initialMessages(ctx));
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [...prev, newMessage("user", trimmed)]);

      window.setTimeout(() => {
        const reply = getBotReply(trimmed, context);
        setMessages((prev) => [...prev, newMessage("bot", reply)]);
      }, 500);
    },
    [context]
  );

  return (
    <ChatContext.Provider
      value={{ isOpen, messages, context, openChat, closeChat, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
