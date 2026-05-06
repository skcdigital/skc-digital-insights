import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, FileText, Receipt, TrendingUp, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type Stats = {
  newLeads: number;
  totalLeads: number;
  openQuotes: number;
  unpaidInvoices: number;
  outstandingValue: number;
  recentChats: number;
};

function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<{ id: string; name: string; service: string | null; status: string; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [newLeads, totalLeads, openQuotes, unpaidInv, chats, recentLeads] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("quotes").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
        supabase.from("invoices").select("id, total, amount_paid", { count: "exact" }).in("status", ["sent", "overdue"]),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
        supabase.from("leads").select("id, name, service, status, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const outstanding = (unpaidInv.data ?? []).reduce((sum, r) => sum + (Number(r.total) - Number(r.amount_paid || 0)), 0);

      setStats({
        newLeads: newLeads.count ?? 0,
        totalLeads: totalLeads.count ?? 0,
        openQuotes: openQuotes.count ?? 0,
        unpaidInvoices: unpaidInv.count ?? 0,
        outstandingValue: outstanding,
        recentChats: chats.count ?? 0,
      });
      setRecent(recentLeads.data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything in one view.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="New leads" value={stats?.newLeads ?? "—"} accent />
        <StatCard icon={<Users className="h-4 w-4" />} label="Total leads" value={stats?.totalLeads ?? "—"} />
        <StatCard icon={<FileText className="h-4 w-4" />} label="Open quotes" value={stats?.openQuotes ?? "—"} />
        <StatCard icon={<Receipt className="h-4 w-4" />} label="Unpaid invoices" value={stats?.unpaidInvoices ?? "—"} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Outstanding (R)" value={stats ? stats.outstandingValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) : "—"} />
        <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Chats (7d)" value={stats?.recentChats ?? "—"} />
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent leads</h2>
          <Link to="/admin/leads" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {recent.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No leads yet.</p>}
          {recent.map((l) => (
            <Link key={l.id} to="/admin/leads/$id" params={{ id: l.id }} className="flex items-center justify-between gap-4 py-3 hover:text-primary">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{l.name}</p>
                <p className="truncate text-xs text-muted-foreground">{l.service ?? "—"}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase">{l.status}</span>
                <p className="mt-1 text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en-ZA")}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/admin/leads" className="rounded-xl border border-primary/40 bg-primary/5 p-4 hover:bg-primary/10">
          <p className="font-semibold">+ Log a lead</p>
          <p className="mt-1 text-xs text-muted-foreground">WhatsApp / call enquiry</p>
        </Link>
        <Link to="/admin/quotes" className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40">
          <p className="font-semibold">+ New quote</p>
          <p className="mt-1 text-xs text-muted-foreground">Branded PDF in 1 click</p>
        </Link>
        <Link to="/admin/invoices" className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40">
          <p className="font-semibold">+ New invoice</p>
          <p className="mt-1 text-xs text-muted-foreground">Send & track</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-surface/40"}`}>
      <div className="flex items-center gap-2 text-primary">{icon}<span className="font-mono text-[10px] uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}