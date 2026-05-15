import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, TicketIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/tickets")({ component: TicketsPage });

type TicketRow = {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  subject: string;
  category: string | null;
  priority: string;
  status: string;
  created_at: string;
};

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

const STATUS_TABS: { value: "all" | TicketStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-300",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-300",
  resolved: "bg-green-500/10 text-green-700 border-green-300",
  closed: "bg-slate-500/10 text-slate-500 border-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-500 border-slate-300",
  medium: "bg-amber-500/10 text-amber-600 border-amber-300",
  high: "bg-red-400/10 text-red-500 border-red-200",
  urgent: "bg-red-600/10 text-red-700 border-red-400",
};

function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("id, number, client_name, client_email, subject, category, priority, status, created_at")
      .order("created_at", { ascending: false });
    setTickets((data as TicketRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = tickets
    .filter((t) => activeTab === "all" || t.status === activeTab)
    .filter((t) => priorityFilter === "all" || t.priority === priorityFilter);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Support Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tickets.filter((t) => t.status === "open").length} open · {tickets.length} total
          </p>
        </div>
        <Link
          to="/admin/tickets/$id"
          params={{ id: "new" }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New ticket
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/40 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">
              {tab.value === "all" ? tickets.length : tickets.filter((t) => t.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Priority:</span>
        {(["all", "low", "medium", "high", "urgent"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              priorityFilter === p
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && (
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
          Loading tickets…
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
          <TicketIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No tickets found for the selected filters.</p>
          {activeTab === "all" && priorityFilter === "all" && (
            <Link
              to="/admin/tickets/$id"
              params={{ id: "new" }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create first ticket
            </Link>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Number</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Subject</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/tickets/$id"
                        params={{ id: t.id }}
                        className="font-mono font-semibold text-primary hover:underline text-sm"
                      >
                        {t.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{t.client_name}</p>
                      <p className="text-xs text-muted-foreground">{t.client_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate text-sm">{t.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{t.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${PRIORITY_COLORS[t.priority] ?? "border-border text-muted-foreground"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[t.status] ?? "border-border text-muted-foreground"}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/tickets/$id"
                        params={{ id: t.id }}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 transition-colors"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {filtered.map((t) => (
              <div key={t.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to="/admin/tickets/$id"
                      params={{ id: t.id }}
                      className="font-mono font-semibold text-primary hover:underline text-sm"
                    >
                      {t.number}
                    </Link>
                    <p className="text-sm font-semibold">{t.client_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${PRIORITY_COLORS[t.priority] ?? "border-border text-muted-foreground"}`}>
                      {t.priority}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_COLORS[t.status] ?? "border-border text-muted-foreground"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <Link
                  to="/admin/tickets/$id"
                  params={{ id: t.id }}
                  className="inline-block rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
