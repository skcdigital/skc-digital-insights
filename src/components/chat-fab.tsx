// src/components/chat-fab.tsx
//
// Floating chat bubble in the bottom-right corner.
// Click to open a small chat window. Click again to close.

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, RefreshCw, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useChat } from "@/hooks/use-chat";
import { SITE, waLink } from "@/lib/site";

export function ChatFab() {
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, loading, error, sendMessage, reset } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[600px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-md flex-col rounded-2xl border border-border bg-background shadow-2xl sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  SKC Digital Assistant
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-border hover:text-foreground"
                aria-label="Reset conversation"
                title="Start over"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-border hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-surface text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <p className="font-medium">{error}</p>
                <a
                  href={waLink("Hi, the chatbot wasn't working — I'd like to ask a question.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] underline"
                >
                  <MessageCircle className="h-3 w-3" /> Message us on WhatsApp instead
                </a>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-primary/40">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about our services..."
                disabled={loading}
                rows={1}
                maxLength={1000}
                className="max-h-32 flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                style={{ minHeight: "20px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 px-1 text-center font-mono text-[10px] text-muted-foreground">
              AI responses can be inaccurate. For quotes, message{" "}
              <a
                href={waLink("Hi, I'd like a quote.")}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:right-6 ${
          open
            ? "bg-surface text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
        aria-label={open ? "Close chat" : "Open chat with SKC Digital Assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
          </span>
        )}
      </button>
    </>
  );
}
