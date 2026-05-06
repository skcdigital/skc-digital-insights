import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/invoices")({ component: () => (
  <div className="space-y-4 pb-20 lg:pb-6">
    <h1 className="font-display text-2xl font-bold">Invoices</h1>
    <p className="rounded-xl border border-border bg-surface/40 p-6 text-sm text-muted-foreground">
      Invoice editor coming next. Database, numbering (SKC-INV-0001), and PDF engine are ready.
    </p>
  </div>
) });