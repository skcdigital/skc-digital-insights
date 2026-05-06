// src/hooks/use-chat.ts
//
// Reusable chat state hook — used by both the floating bubble and /chat page

import { useCallback, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to SKC Digital. I'm here to help you learn about our services and start your project. How can I assist you today?",
  timestamp: Date.now(),
};

const CHAT_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-agent`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        // Send only the conversation (skip the local "welcome" id)
        const conversationForApi = newMessages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
          },
          body: JSON.stringify({ messages: conversationForApi }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message,
            timestamp: Date.now(),
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Sorry, I couldn't reach the assistant. Please try WhatsApp instead.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const reset = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
    reset,
  };
}
