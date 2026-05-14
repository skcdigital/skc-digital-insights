import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, FileText, Receipt, TrendingUp, MessageSquare,
  TicketIcon, ArrowRight, PhoneCall, Mail, Globe,
  Share2, AlertTriangle, CheckCircle2, Clock, XCircle, Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

/* ── Types ───────────────────────────────────────────────── */
type Pipeline = { new: number; contacted: number; quoted: number; won: number; lost: number };
type MonthBar  = { label: string; collected: number; invoiced: number };
type RecentLead = {
  id: string; name: string; service: string | null;
  status: string; channel: string; estimated_value: number | null; created_at: string;
};
type RecentInvoice = {
  id: string; number: string; client_name: string;
  total: number; amount_paid: number; status: string;
  due_date: string | null; created_at: string;
};
type Stats = {
  pipeline: Pipeline;
  openQuotes: number;
  openQuotesValue: number;
  revenueCollected: number;
  outstanding: number;
  openTickets: number;
  recentChats: number;
};

/* ── Helpers ─────────────────────────────────────────────── */
const ZAR = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare className="h-3 w-3" />,
  email:    <Mail className="h-3 w-3" />,
  phone:    <PhoneCall className="h-3 w-3" />,
  form:     <Globe className="h-3 w-3" />,
  referral: <Share2 className="h-3 w-3" />,
};

const STATUS_STYLE: Record<string, string> = {
  new:       "bg-sky-500/15 text-sky-400 border-sky-500/30",
  contacted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  quoted:    "bg-violet-500/15 text-violet-400 border-violet-500/30",
  won:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  lost:      "bg-red-500/15 text-red-400 border-red-500/30",
  draft:     "bg-zinc-700/40 text-zinc-400 border-zinc-700",
  sent:      "bg-sky-500/15 text-sky-400 border-sky-500/30",
  paid:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue:   "bg-red-500/15 text-red-400 border-red-500/30",
  cancelled: "bg-zinc-700/40 text-zinc-400 border-zinc-700",
  open:      "bg-amber-500/15 text-amber-400 border-amber-500/30",
  in_progress:"bg-violet-500/15 text-violet-400 border-violet-500/30",
  resolved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  accepted:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function Badge({ s }: { s: string }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${STATUS_STYLE[s] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-700"}`}>
      {s.replace("_", " ")}
    </span>
  );
}

function buildMonthBars(invoices: { issue_date: string; amount_paid: number; total: number; status: string }[]): MonthBar[] {
  const now = new Date();
  const bars: MonthBar[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: MONTHS[d.getMonth()] + " '" + String(d.getFullYear()).slice(2), collected: 0, invoiced: 0 };
  });
  invoices.forEach((inv) => {
    const d = new Date(inv.issue_date);
    const idx = bars.findIndex(b => b.label === MONTHS[d.getMonth()] + " '" + String(d.getFullYear()).slice(2));
    if (idx === -1) return;
    bars[idx].invoiced += Number(inv.total);
    if (inv.status === "paid") bars[idx].collected += Number(inv.amount_paid);
  });
  return bars;
}

/* ── Main Component ──────────────────────────────────────── */
function AdminHome() {
  const [stats, setStats]           = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads]     = useState<RecentLead[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [monthBars, setMonthBars]   = useState<MonthBar[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [
        leadsRes, openQuotesRes, invoicesRes,
        openTicketsRes, chatsRes, recentLeadsRes, recentInvoicesRes,
      ] = await Promise.all([
        supabase.from("leads").select("status"),
        supabase.from("quotes").select("id, total").in("status", ["draft", "sent"]),
        supabase.from("invoices").select("id, total, amount_paid, status, issue_date"),
        supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
        supabase.from("leads").select("id, name, service, status, channel, estimated_value, created_at")
          .order("created_at", { ascending: false }).limit(6),
        supabase.from("invoices").select("id, number, client_name, total, amount_paid, status, due_date, created_at")
          .order("created_at", { ascending: false }).limit(6),
      ]);

      const leads = leadsRes.data ?? [];
      const pipeline: Pipeline = { new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
      leads.forEach((l) => { if (l.status in pipeline) pipeline[l.status as keyof Pipeline]++; });

      const allInvoices = invoicesRes.data ?? [];
      const revenueCollected = allInvoices
        .filter(i => i.status === "paid")
        .reduce((s, i) => s + Number(i.amount_paid), 0);
      const outstanding = allInvoices
        .filter(i => ["sent", "overdue"].includes(i.status))
        .reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0);

      const openQuotesArr = openQuotesRes.data ?? [];

      setStats({
        pipeline,
        openQuotes: openQuotesArr.length,
        openQuotesValue: openQuotesArr.reduce((s, q) => s + Number(q.total), 0),
        revenueCollected,
        outstanding,
        openTickets: openTicketsRes.count ?? 0,
        recentChats: chatsRes.count ?? 0,
      });

      setRecentLeads(recentLeadsRes.data ?? []);
      setRecentInvoices(recentInvoicesRes.data ?? []);

      const sixMonthInvoices = allInvoices.filter(
        i => new Date(i.issue_date) >= sixMonthsAgo
      );
      setMonthBars(buildMonthBars(sixMonthInvoices));
      setLoading(false);
    })();
  }, []);

  const p = stats?.pipeline;
  const pipelineTotal = p ? p.new + p.contacted + p.quoted + p.won + p.lost : 0;
  const reachRate = pipelineTotal ? Math.round(((p!.contacted + p!.quoted + p!.won) / pipelineTotal) * 100) : 0;
  const convRate  = pipelineTotal ? Math.round((p!.won / pipelineTotal) * 100) : 0;
  const maxBar = Math.max(...monthBars.map(b => b.invoiced), 1);
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5 pb-24 lg:pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary">SKC Digital · CRM</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">{today}</p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="New leads"
          value={loading ? "—" : p!.new}
          icon={<Users className="h-4 w-4" />}
          color="sky"
        />
        <KpiCard
          label="Customers reached"
          value={loading ? "—" : (p!.contacted + p!.quoted + p!.won)}
          sub={loading ? "" : `${reachRate}% of total`}
          icon={<PhoneCall className="h-4 w-4" />}
          color="amber"
        />
        <KpiCard
          label="Deals won"
          value={loading ? "—" : p!.won}
          sub={loading ? "" : `${convRate}% conversion`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="emerald"
        />
        <KpiCard
          label="Revenue collected"
          value={loading ? "—" : ZAR(stats!.revenueCollected)}
          icon={<TrendingUp className="h-4 w-4" />}
          color="primary"
          wide
        />
        <KpiCard
          label="Outstanding"
          value={loading ? "—" : ZAR(stats!.outstanding)}
          sub={loading ? "" : `${stats!.openQuotes} open quote${stats!.openQuotes !== 1 ? "s" : ""}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          color={stats?.outstanding ? "red" : "zinc"}
        />
        <KpiCard
          label="Support tickets"
          value={loading ? "—" : stats!.openTickets}
          sub={loading ? "" : `${stats!.recentChats} chats (7d)`}
          icon={<TicketIcon className="h-4 w-4" />}
          color={stats?.openTickets ? "violet" : "zinc"}
        />
      </div>

      {/* ── Pipeline + Revenue ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">

        {/* Pipeline funnel */}
        <Panel title="Sales Pipeline" icon={<Users className="h-3.5 w-3.5" />}>
          {loading ? <Skeleton rows={5} /> : (
            <div className="space-y-2.5">
              {([
                { label: "New",       count: p!.new,       color: "bg-sky-500" },
                { label: "Contacted", count: p!.contacted, color: "bg-amber-500" },
                { label: "Quoted",    count: p!.quoted,    color: "bg-violet-500" },
                { label: "Won",       count: p!.won,       color: "bg-emerald-500" },
                { label: "Lost",      count: p!.lost,      color: "bg-red-500/70" },
              ] as const).map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">{label}</span>
                  <div className="relative flex-1 overflow-hidden rounded-full bg-zinc-800/60 h-5">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: pipelineTotal ? `${Math.max((count / pipelineTotal) * 100, count ? 4 : 0)}%` : "0%" }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right font-mono text-xs font-bold text-foreground">{count}</span>
                </div>
              ))}
              <div className="mt-3 flex gap-4 border-t border-border/40 pt-3">
                <Pill label="Total" value={pipelineTotal} />
                <Pill label="Reach rate" value={`${reachRate}%`} accent />
                <Pill label="Win rate" value={`${convRate}%`} accent />
              </div>
            </div>
          )}
        </Panel>

        {/* Revenue bar chart */}
        <Panel title="Revenue · Last 6 months" icon={<Receipt className="h-3.5 w-3.5" />}>
          {loading ? <Skeleton rows={4} /> : (
            <>
              <div className="flex h-28 items-end gap-1.5">
                {monthBars.map((b) => (
                  <div key={b.label} className="group relative flex flex-1 flex-col items-center gap-1">
                    {/* invoiced bar (background) */}
                    <div className="relative w-full overflow-hidden rounded-sm bg-zinc-800/60"
                      style={{ height: "112px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-sm bg-primary/20 transition-all duration-700"
                        style={{ height: `${(b.invoiced / maxBar) * 100}%` }}
                      />
                      <div
                        className="absolute bottom-0 w-full rounded-sm bg-primary transition-all duration-700"
                        style={{ height: `${(b.collected / maxBar) * 100}%` }}
                      />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 border border-zinc-700 px-2 py-1 font-mono text-[10px] group-hover:block">
                      {ZAR(b.collected)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between">
                {monthBars.map(b => (
                  <span key={b.label} className="flex-1 text-center font-mono text-[9px] text-muted-foreground">{b.label}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-4 border-t border-border/40 pt-3">
                <Pill label="Collected" value={ZAR(stats!.revenueCollected)} accent />
                <Pill label="Invoiced" value={ZAR(monthBars.reduce((s, b) => s + b.invoiced, 0))} />
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-primary" />
                  <span className="font-mono text-[10px] text-muted-foreground">Paid</span>
                  <span className="ml-1 h-2 w-2 rounded-sm bg-primary/20" />
                  <span className="font-mono text-[10px] text-muted-foreground">Invoiced</span>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* ── Recent Leads + Invoices ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent Leads */}
        <Panel
          title="Recent Leads"
          icon={<Users className="h-3.5 w-3.5" />}
          action={<Link to="/admin/leads" className="font-mono text-[10px] text-primary hover:underline">View all →</Link>}
        >
          {loading ? <Skeleton rows={5} /> : recentLeads.length === 0 ? (
            <Empty label="No leads yet — log your first one below" />
          ) : (
            <div className="divide-y divide-border/40">
              {recentLeads.map((l) => (
                <Link key={l.id} to="/admin/leads/$id" params={{ id: l.id }}
                  className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80 transition-opacity">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 text-muted-foreground">
                      {CHANNEL_ICON[l.channel] ?? <Globe className="h-3 w-3" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{l.name}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{l.service ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge s={l.status} />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("en-ZA")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Invoices */}
        <Panel
          title="Recent Invoices"
          icon={<Receipt className="h-3.5 w-3.5" />}
          action={<Link to="/admin/invoices" className="font-mono text-[10px] text-primary hover:underline">View all →</Link>}
        >
          {loading ? <Skeleton rows={5} /> : recentInvoices.length === 0 ? (
            <Empty label="No invoices yet — create one below" />
          ) : (
            <div className="divide-y divide-border/40">
              {recentInvoices.map((inv) => {
                const paid = inv.status === "paid";
                const owed = Number(inv.total) - Number(inv.amount_paid);
                return (
                  <Link key={inv.id} to="/admin/invoices/$id" params={{ id: inv.id }}
                    className="flex items-center justify-between gap-3 py-2.5 hover:opacity-80 transition-opacity">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{inv.client_name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{inv.number}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`font-mono text-sm font-bold ${paid ? "text-emerald-400" : inv.status === "overdue" ? "text-red-400" : "text-foreground"}`}>
                        {paid ? ZAR(inv.amount_paid) : ZAR(owed)}
                      </span>
                      <Badge s={inv.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction to="/admin/leads"    icon={<Users className="h-4 w-4" />}    label="Log a lead"    sub="WhatsApp / call enquiry" accent />
        <QuickAction to="/admin/quotes"   icon={<FileText className="h-4 w-4" />}  label="New quote"     sub="Branded PDF in 1 click" />
        <QuickAction to="/admin/invoices" icon={<Receipt className="h-4 w-4" />}   label="New invoice"   sub="Send & track payment" />
        <QuickAction to="/admin/chats"    icon={<MessageSquare className="h-4 w-4" />} label="View chats" sub="AI chat history" />
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function KpiCard({
  label, value, sub, icon, color, wide,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; wide?: boolean;
}) {
  const accent: Record<string, string> = {
    sky:     "text-sky-400 bg-sky-500/10 border-sky-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    primary: "text-primary bg-primary/10 border-primary/20",
    red:     "text-red-400 bg-red-500/10 border-red-500/20",
    violet:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
    zinc:    "text-zinc-400 bg-zinc-700/20 border-zinc-700/40",
  };
  return (
    <div className={`rounded-xl border border-border/60 bg-surface/30 p-4 ${wide ? "col-span-1" : ""}`}>
      <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase ${accent[color] ?? accent.zinc}`}>
        {icon} {label}
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Panel({
  title, icon, action, children,
}: {
  title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
          {icon} {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`font-mono text-xs font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-center font-mono text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded-md bg-zinc-800/50" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

function QuickAction({
  to, icon, label, sub, accent,
}: {
  to: string; icon: React.ReactNode; label: string; sub: string; accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
        accent
          ? "border-primary/30 bg-primary/8 hover:bg-primary/15"
          : "border-border/60 bg-surface/30 hover:border-primary/30"
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${accent ? "text-primary" : "text-muted-foreground group-hover:text-primary"} transition-colors`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </Link>
  );
}
