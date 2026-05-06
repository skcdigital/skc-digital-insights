// src/routes/chat.tsx
//
// Full-page chat experience at skcdigital.co.za/chat
// Same chat backend as the floating bubble, but with a richer layout.

import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, RefreshCw, MessageCircle, Mail, Phone, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useChat } from "@/hooks/use-chat";
import { SITE, waLink } from "@/lib/site";

const TITLE = "Chat with SKC Digital | Live AI Assistant";
const DESC =
  "Ask SKC Digital's AI assistant about our IT services, pricing, and process. Or message us directly on WhatsApp for a personalised quote.";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/chat` },
    ],
  }),
  component: ChatPage,
});

const SUGGESTED_PROMPTS = [
  "What services do you offer?",
  "How much for a website?",
  "Can you build me a chatbot?",
  "Tell me about your monthly retainer",
  "Do you work outside Pretoria?",
  "How does payment work?",
];

function ChatPage() {
  const { messages, input, setInput, loading, error, sendMessage, reset } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <PageHero
        eyebrow="AI Assistant"
        title={
          <>
            Chat with the <span className="text-gradient">SKC Digital Assistant</span>
          </>
        }
        description="Ask anything about our services, pricing, or process. The assistant is trained on everything we offer and can guide you to the right solution. For binding quotes, you'll be directed to WhatsApp."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface/40 p-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-xs uppercase tracking-wider">
                  Try asking
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface/40 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-primary">
                Prefer a human?
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Skip the AI — message us directly for a personalised quote within 4 hours.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href={waLink(`Hi ${SITE.name}, I'd like to chat about a project.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground hover:border-primary/40"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {SITE.email}
                </a>
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground hover:border-primary/40"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {SITE.phone}
                </a>
              </div>
            </div>

            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Start a new conversation
            </button>
          </aside>

          {/* CHAT WINDOW */}
          <div className="flex h-[calc(100vh-12rem)] min-h-[500px] flex-col rounded-2xl border border-border bg-surface/30">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">SKC Digital Assistant</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Online · powered by Azure AI
                  </p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-background text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-background px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  <p className="font-medium">{error}</p>
                  <a
                    href={waLink("Hi, the chatbot wasn't working — I'd like to ask a question.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs underline"
                  >
                    <MessageCircle className="h-3 w-3" /> Message us on WhatsApp instead
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-4 py-2.5 focus-within:border-primary/40">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  disabled={loading}
                  rows={1}
                  maxLength={1000}
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                  style={{ minHeight: "24px" }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
                AI responses can be inaccurate. For binding quotes,{" "}
                <a
                  href={waLink("Hi, I'd like a quote.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  message us on WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
