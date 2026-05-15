import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/credit-notes")({ component: CreditNotesPage });

type CreditNote = {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  total: number;
  reason: string | null;
  status: string;
  issue_date: string;
  created_at: string;
};

type CNStatus = "draft" | "issued" | "applied" | "cancelled";

const STATUS_TABS: { value: "all" | CNStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "applied", label: "Applied" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-300",
  issued: "bg-purple-500/10 text-purple-600 border-purple-300",
  applied: "bg-green-500/10 text-green-700 border-green-300",
  cancelled: "bg-red-400/10 text-red-500 border-red-200",
};

function CreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | CNStatus>("all");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("credit_notes")
      .select("id, number, client_name, client_email, total, reason, status, issue_date, created_at")
      .order("created_at", { ascending: false });
    setNotes((data as CreditNote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = activeTab === "all" ? notes : notes.filter((n) => n.status === activeTab);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Credit Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {notes.length} credit note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/admin/credit-notes/$id"
          params={{ id: "new" }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New credit note
        </Link>
      </div>

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
              {tab.value === "all" ? notes.length : notes.filter((n) => n.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
          Loading credit notes…
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
          <RotateCcw className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No credit notes{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.
          </p>
          {activeTab === "all" && (
            <Link
              to="/admin/credit-notes/$id"
              params={{ id: "new" }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create first credit note
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
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/credit-notes/$id"
                        params={{ id: n.id }}
                        className="font-mono font-semibold text-primary hover:underline text-sm"
                      >
                        {n.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{n.client_name}</p>
                      <p className="text-xs text-muted-foreground">{n.client_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      R {Number(n.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
                      {n.reason ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[n.status] ?? "border-border text-muted-foreground"}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(n.issue_date).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/credit-notes/$id"
                        params={{ id: n.id }}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {filtered.map((n) => (
              <div key={n.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to="/admin/credit-notes/$id"
                      params={{ id: n.id }}
                      className="font-mono font-semibold text-primary hover:underline text-sm"
                    >
                      {n.number}
                    </Link>
                    <p className="text-sm font-semibold">{n.client_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.issue_date).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      R {Number(n.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_COLORS[n.status] ?? "border-border text-muted-foreground"}`}>
                      {n.status}
                    </span>
                  </div>
                </div>
                <Link
                  to="/admin/credit-notes/$id"
                  params={{ id: n.id }}
                  className="inline-block rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
