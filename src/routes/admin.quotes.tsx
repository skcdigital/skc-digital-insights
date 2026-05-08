import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Download, Send, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateQuoteDocPdf, blobToBase64, downloadBlob } from "@/lib/admin-pdf";
import type { QuoteDoc, DocItem } from "@/lib/admin-pdf";

export const Route = createFileRoute("/admin/quotes")({ component: QuotesPage });

type Quote = {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  total: number;
  status: string;
  issue_date: string;
  created_at: string;
};

type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

const STATUS_TABS: { value: "all" | QuoteStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-300",
  sent: "bg-blue-500/10 text-blue-600 border-blue-300",
  accepted: "bg-green-500/10 text-green-700 border-green-300",
  declined: "bg-red-400/10 text-red-500 border-red-200",
  expired: "bg-slate-400/10 text-slate-400 border-slate-200",
};

function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | QuoteStatus>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("quotes")
      .select("id, number, client_name, client_email, total, status, issue_date, created_at")
      .order("created_at", { ascending: false });
    setQuotes((data as Quote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDownload(quote: Quote) {
    setActionLoading(quote.id + "-dl");
    try {
      const { data: items } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("position");
      const { data: full } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quote.id)
        .single();
      if (!full) return;
      const blob = await generateQuoteDocPdf(full as QuoteDoc, (items ?? []) as DocItem[]);
      downloadBlob(blob, `SKC-Quote-${quote.number}.pdf`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSend(quote: Quote) {
    if (!quote.client_email) {
      setSendStatus((p) => ({ ...p, [quote.id]: "No email on record." }));
      return;
    }
    setActionLoading(quote.id + "-send");
    setSendStatus((p) => ({ ...p, [quote.id]: "" }));
    try {
      const { data: items } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("position");
      const { data: full } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quote.id)
        .single();
      if (!full) return;
      const blob = await generateQuoteDocPdf(full as QuoteDoc, (items ?? []) as DocItem[]);
      const pdfBase64 = await blobToBase64(blob);
      const res = await fetch("/api/send-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          clientName: quote.client_name,
          clientEmail: quote.client_email,
          docNumber: quote.number,
          pdfBase64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Send failed");
      await supabase.from("quotes").update({ status: "sent" }).eq("id", quote.id);
      setSendStatus((p) => ({ ...p, [quote.id]: "Sent!" }));
      load();
    } catch (err: unknown) {
      setSendStatus((p) => ({ ...p, [quote.id]: err instanceof Error ? err.message : "Failed" }));
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = activeTab === "all" ? quotes : quotes.filter((q) => q.status === activeTab);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Quotes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          to="/admin/quotes/$id"
          params={{ id: "new" }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New quote
        </Link>
      </div>

      {/* Status filter tabs */}
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
              {tab.value === "all" ? quotes.length : quotes.filter((q) => q.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Loading quotes…</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No quotes{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.</p>
          {activeTab === "all" && (
            <Link
              to="/admin/quotes/$id"
              params={{ id: "new" }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create first quote
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
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link to="/admin/quotes/$id" params={{ id: q.id }} className="font-mono font-semibold text-primary hover:underline text-sm">
                        {q.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{q.client_name}</p>
                      <p className="text-xs text-muted-foreground">{q.client_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      R {Number(q.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[q.status] ?? "border-border text-muted-foreground"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(q.issue_date).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          to="/admin/quotes/$id"
                          params={{ id: q.id }}
                          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDownload(q)}
                          disabled={actionLoading === q.id + "-dl"}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 disabled:opacity-50 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          {actionLoading === q.id + "-dl" ? "…" : "PDF"}
                        </button>
                        <button
                          onClick={() => handleSend(q)}
                          disabled={actionLoading === q.id + "-send" || !q.client_email}
                          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          {actionLoading === q.id + "-send" ? "Sending…" : "Send"}
                        </button>
                        {sendStatus[q.id] && (
                          <span className={`text-[10px] ${sendStatus[q.id] === "Sent!" ? "text-green-600" : "text-red-500"}`}>
                            {sendStatus[q.id]}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="divide-y divide-border md:hidden">
            {filtered.map((q) => (
              <div key={q.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to="/admin/quotes/$id" params={{ id: q.id }} className="font-mono font-semibold text-primary hover:underline text-sm">
                      {q.number}
                    </Link>
                    <p className="text-sm font-semibold">{q.client_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(q.issue_date).toLocaleDateString("en-ZA")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">R {Number(q.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${STATUS_COLORS[q.status] ?? "border-border text-muted-foreground"}`}>
                      {q.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/admin/quotes/$id" params={{ id: q.id }} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40">View</Link>
                  <button onClick={() => handleDownload(q)} disabled={actionLoading === q.id + "-dl"} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 disabled:opacity-50">
                    <Download className="h-3 w-3" />{actionLoading === q.id + "-dl" ? "…" : "PDF"}
                  </button>
                  <button onClick={() => handleSend(q)} disabled={actionLoading === q.id + "-send" || !q.client_email} className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs text-primary disabled:opacity-50">
                    <Send className="h-3 w-3" />{actionLoading === q.id + "-send" ? "Sending…" : "Send"}
                  </button>
                </div>
                {sendStatus[q.id] && (
                  <p className={`text-[10px] ${sendStatus[q.id] === "Sent!" ? "text-green-600" : "text-red-500"}`}>{sendStatus[q.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
