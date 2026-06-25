"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MessageCircle, Send, X, Minus, Bot } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { defaultQuickReplies } from "@/lib/chatbot";

function ChatLink({ href, children }: { href: string; children: string }) {
  const { closeChat } = useChat();
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-primary-700 underline"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="font-semibold text-primary-700 underline"
      onClick={closeChat}
    >
      {children}
    </Link>
  );
}

function formatChatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <ChatLink key={i} href={linkMatch[2]}>
          {linkMatch[1]}
        </ChatLink>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function BotMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
      {lines.map((line, i) => (
        <p key={i}>{line ? formatChatText(line) : <br />}</p>
      ))}
    </div>
  );
}

function ChatWidgetUI() {
  const { isOpen, messages, context, openChat, closeChat, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const quickReplies = defaultQuickReplies(context?.orderId);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex justify-end p-4 sm:p-5"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-[400px] flex-col items-end">
        {isOpen ? (
          <div className="flex h-[min(520px,calc(100dvh-2.5rem))] w-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">MedLive Assist</p>
                  <p className="text-xs text-primary-100">Usually replies instantly</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-lg p-1.5 hover:bg-white/15"
                  aria-label="Minimize chat"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-lg p-1.5 hover:bg-white/15"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={listRef}
              className="flex-1 space-y-4 overflow-y-auto bg-surface-muted/40 p-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === "user"
                        ? "rounded-br-md bg-primary-600 text-white"
                        : "rounded-bl-md border border-border bg-white shadow-xs"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.text}</p>
                    ) : (
                      <BotMessage text={msg.text} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-white p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {quickReplies.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => sendMessage(label)}
                    className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-800 transition hover:bg-primary-100"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="input-field flex-1 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="btn-primary shrink-0 px-3.5 py-2.5 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openChat()}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition hover:scale-105 hover:shadow-xl"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Help</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<ChatWidgetUI />, document.body);
}
