import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  channel: string;
  status: string;
  created_at: string;
};

type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

const STATUS_TABS: { value: "all" | LeadStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-300",
  contacted: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-300",
  won: "bg-green-500/10 text-green-700 border-green-300",
  lost: "bg-red-400/10 text-red-500 border-red-200",
};

const CHANNELS = ["whatsapp", "email", "phone", "referral", "form", "other"];
const SERVICES = [
  "Website Design",
  "E-Commerce",
  "SEO",
  "Social Media",
  "Branding",
  "Digital Marketing",
  "App Development",
  "IT Support",
  "Other",
];

type NewLeadForm = {
  name: string;
  phone: string;
  email: string;
  service: string;
  channel: string;
  message: string;
};

const EMPTY_FORM: NewLeadForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  channel: "whatsapp",
  message: "",
};

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | LeadStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewLeadForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, name, email, phone, service, channel, status, created_at")
      .order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: LeadStatus) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    setSaving(true);
    setFormError("");
    const { error } = await supabase.from("leads").insert({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      service: form.service.trim() || null,
      channel: form.channel as "form" | "whatsapp" | "email" | "phone" | "referral" | "other",
      message: form.message.trim() || null,
      status: "new",
    });
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  }

  const filtered = activeTab === "all" ? leads : leads.filter((l) => l.status === activeTab);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">{leads.length} total lead{leads.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(""); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New lead"}
        </button>
      </div>

      {/* Inline new lead form */}
      {showForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-4 font-display text-base font-bold">Log a new lead</h2>
          {formError && (
            <p className="mb-3 rounded-md bg-red-500/10 border border-red-300 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+27 82 000 0000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Service</label>
              <input
                value={form.service}
                list="service-options"
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                placeholder="Website Design"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <datalist id="service-options">
                {SERVICES.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Message / Notes</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Brief description of what they need…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : "Save lead"}
              </button>
            </div>
          </form>
        </div>
      )}

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
            {tab.value === "all" && leads.length > 0 && (
              <span className="ml-1.5 opacity-70">{leads.length}</span>
            )}
            {tab.value !== "all" && (
              <span className="ml-1.5 opacity-70">
                {leads.filter((l) => l.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading && (
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
          Loading leads…
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">No leads{activeTab !== "all" ? ` with status "${activeTab}"` : ""} yet.</p>
          {activeTab === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Log your first lead
            </button>
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
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Service</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Channel</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/leads/$id"
                        params={{ id: lead.id }}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {lead.email ?? lead.phone ?? "no contact"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.service ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] uppercase text-muted-foreground">{lead.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/admin/leads/$id"
                          params={{ id: lead.id }}
                          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-primary/40 transition-colors"
                        >
                          View
                        </Link>
                        <StatusDropdown
                          status={lead.status as LeadStatus}
                          onChange={(s) => updateStatus(lead.id, s)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="divide-y divide-border md:hidden">
            {filtered.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-3 p-4">
                <Link to="/admin/leads/$id" params={{ id: lead.id }} className="min-w-0 flex-1">
                  <p className="truncate font-semibold hover:text-primary transition-colors">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.service ?? "—"} · {lead.channel}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("en-ZA")}</p>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={lead.status} />
                  <StatusDropdown status={lead.status as LeadStatus} onChange={(s) => updateStatus(lead.id, s)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[status] ?? "border-border text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function StatusDropdown({ status, onChange }: { status: LeadStatus; onChange: (s: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);
  const statuses: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:border-primary/40 transition-colors"
      >
        Status <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-border bg-background shadow-lg">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface transition-colors ${s === status ? "font-semibold text-primary" : "text-foreground"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s === "new" ? "bg-blue-500" : s === "contacted" ? "bg-yellow-500" : s === "quoted" ? "bg-purple-500" : s === "won" ? "bg-green-500" : "bg-red-400"}`} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
