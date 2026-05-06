import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/quotes")({ component: () => (
  <div className="space-y-4 pb-20 lg:pb-6">
    <h1 className="font-display text-2xl font-bold">Quotes</h1>
    <p className="rounded-xl border border-border bg-surface/40 p-6 text-sm text-muted-foreground">
      The full quote editor (line items, branded PDF, email-to-client) is coming in the next iteration.
      For now, the database is ready and the lead inbox at <Link to="/admin/leads" className="text-primary hover:underline">/admin/leads</Link> tracks all incoming requests.
    </p>
  </div>
) });