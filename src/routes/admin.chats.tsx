import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/chats")({ component: () => (
  <div className="space-y-4 pb-20 lg:pb-6">
    <h1 className="font-display text-2xl font-bold">Chatbot conversations</h1>
    <p className="rounded-xl border border-border bg-surface/40 p-6 text-sm text-muted-foreground">
      Visitor chats will appear here once the chatbot widget is wired up in the next iteration.
    </p>
  </div>
) });