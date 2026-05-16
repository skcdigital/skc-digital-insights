import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, CreditCard, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/memberships")({ component: MembershipsAdminPage });

type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_annual: number | null;
  currency: string;
  stripe_price_monthly: string | null;
  stripe_price_annual: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
};

type Subscription = {
  id: string;
  email: string;
  plan_name: string;
  status: string;
  billing_interval: string;
  current_period_end: string | null;
  created_at: string;
};

type PlanForm = {
  name: string;
  tagline: string;
  price_monthly: string;
  price_annual: string;
  stripe_price_monthly: string;
  stripe_price_annual: string;
  features: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_PLAN: PlanForm = {
  name: "", tagline: "", price_monthly: "0", price_annual: "",
  stripe_price_monthly: "", stripe_price_annual: "",
  features: "", is_popular: false, is_active: true, sort_order: "0",
};

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-500/10 text-green-700 border-green-300",
  past_due:  "bg-yellow-500/10 text-yellow-700 border-yellow-300",
  cancelled: "bg-red-400/10 text-red-500 border-red-200",
  trialing:  "bg-blue-500/10 text-blue-600 border-blue-300",
  paused:    "bg-gray-400/10 text-gray-500 border-gray-300",
};

function MembershipsAdminPage() {
  const [tab, setTab] = useState<"plans" | "subscribers">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPlans() {
    setLoading(true);
    const { data } = await supabase
      .from("membership_plans")
      .select("*")
      .order("sort_order", { ascending: true });
    setPlans((data as Plan[]) ?? []);
    setLoading(false);
  }

  async function loadSubs() {
    setLoading(true);
    const { data } = await supabase
      .from("user_memberships")
      .select(`
        id, status, billing_interval, current_period_end, created_at,
        profiles!inner(email),
        membership_plans!inner(name)
      `)
      .order("created_at", { ascending: false });
    const mapped: Subscription[] = (data ?? []).map((r: any) => ({
      id: r.id,
      email: r.profiles?.email ?? "—",
      plan_name: r.membership_plans?.name ?? "—",
      status: r.status,
      billing_interval: r.billing_interval,
      current_period_end: r.current_period_end,
      created_at: r.created_at,
    }));
    setSubs(mapped);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === "plans") loadPlans();
    else loadSubs();
  }, [tab]);

  function openEdit(p: Plan) {
    setEditing(p);
    setForm({
      name: p.name,
      tagline: p.tagline ?? "",
      price_monthly: String(p.price_monthly),
      price_annual: p.price_annual != null ? String(p.price_annual) : "",
      stripe_price_monthly: p.stripe_price_monthly ?? "",
      stripe_price_annual: p.stripe_price_annual ?? "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
      is_popular: p.is_popular,
      is_active: p.is_active,
      sort_order: String(p.sort_order),
    });
    setError("");
    setShowForm(true);
  }

  function f(key: keyof PlanForm, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      price_monthly: parseFloat(form.price_monthly) || 0,
      price_annual: form.price_annual ? parseFloat(form.price_annual) : null,
      stripe_price_monthly: form.stripe_price_monthly.trim() || null,
      stripe_price_annual: form.stripe_price_annual.trim() || null,
      features: form.features.split("\n").map((l) => l.trim()).filter(Boolean),
      is_popular: form.is_popular,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };
    const { error: err } = await supabase
      .from("membership_plans")
      .update(payload)
      .eq("id", editing.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    loadPlans();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Memberships</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage plans and active subscribers</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface/40 p-1 w-fit">
        <TabBtn active={tab === "plans"} onClick={() => setTab("plans")}>
          <CreditCard className="h-3.5 w-3.5" /> Plans
        </TabBtn>
        <TabBtn active={tab === "subscribers"} onClick={() => setTab("subscribers")}>
          <Users className="h-3.5 w-3.5" /> Subscribers
        </TabBtn>
      </div>

      {/* Edit plan modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-8">
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-md p-1 hover:bg-border">
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold">Edit plan — {editing.name}</h2>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Plan name">
                  <input value={form.name} onChange={(e) => f("name", e.target.value)} required className={INPUT} />
                </Field>
                <Field label="Tagline">
                  <input value={form.tagline} onChange={(e) => f("tagline", e.target.value)} className={INPUT} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Monthly price (ZAR)">
                  <input type="number" min="0" step="0.01" value={form.price_monthly} onChange={(e) => f("price_monthly", e.target.value)} required className={INPUT} />
                </Field>
                <Field label="Annual price (ZAR)">
                  <input type="number" min="0" step="0.01" value={form.price_annual} onChange={(e) => f("price_annual", e.target.value)} placeholder="Optional" className={INPUT} />
                </Field>
                <Field label="Sort order">
                  <input type="number" value={form.sort_order} onChange={(e) => f("sort_order", e.target.value)} className={INPUT} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Stripe monthly price ID">
                  <input value={form.stripe_price_monthly} onChange={(e) => f("stripe_price_monthly", e.target.value)} placeholder="price_..." className={INPUT} />
                </Field>
                <Field label="Stripe annual price ID">
                  <input value={form.stripe_price_annual} onChange={(e) => f("stripe_price_annual", e.target.value)} placeholder="price_..." className={INPUT} />
                </Field>
              </div>
              <Field label="Features (one per line)">
                <textarea value={form.features} onChange={(e) => f("features", e.target.value)} rows={6} placeholder={"Professional website&#10;SEO setup&#10;Priority support"} className={`${INPUT} resize-none`} />
              </Field>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_popular} onChange={(e) => f("is_popular", e.target.checked)} className="h-4 w-4 rounded" />
                  Mark as most popular
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => f("is_active", e.target.checked)} className="h-4 w-4 rounded" />
                  Plan is active
                </label>
              </div>
              {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary/40">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : tab === "plans" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-6 ${p.is_popular ? "border-primary/40 bg-primary/5" : "border-border bg-surface/40"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                </div>
                <button onClick={() => openEdit(p)} className="rounded-md p-1.5 hover:bg-border" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-4 text-2xl font-bold">R{p.price_monthly.toLocaleString("en-ZA")}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              {p.price_annual && (
                <p className="text-xs text-muted-foreground">R{p.price_annual.toLocaleString("en-ZA")}/year</p>
              )}
              <ul className="mt-4 space-y-1.5">
                {(Array.isArray(p.features) ? p.features : []).slice(0, 4).map((feat) => (
                  <li key={feat} className="text-xs text-muted-foreground">· {feat}</li>
                ))}
                {(Array.isArray(p.features) ? p.features : []).length > 4 && (
                  <li className="text-xs text-muted-foreground">+{(Array.isArray(p.features) ? p.features : []).length - 4} more</li>
                )}
              </ul>
              <div className="mt-4 flex gap-2 flex-wrap">
                {p.is_popular && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">Popular</span>}
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${p.is_active ? "border-green-300 bg-green-500/10 text-green-700" : "border-border text-muted-foreground"}`}>
                  {p.is_active ? "Active" : "Inactive"}
                </span>
                {p.stripe_price_monthly && <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-muted-foreground">Stripe ✓</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {subs.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              No active subscribers yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/60">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscriber</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Billing</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/40">
                    <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                    <td className="px-4 py-3">{s.plan_name}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{s.billing_interval}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] capitalize ${STATUS_COLORS[s.status] ?? "border-border text-muted-foreground"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-ZA") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none";
