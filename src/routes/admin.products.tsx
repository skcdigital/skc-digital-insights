import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, X, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdminPage });

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  price_zar: number;
  cover_url: string | null;
  is_published: boolean;
  is_free: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  created_at: string;
};

type ProductForm = {
  slug: string;
  title: string;
  description: string;
  type: string;
  price_zar: string;
  cover_url: string;
  is_published: boolean;
  is_free: boolean;
  sort_order: string;
  stripe_price_id: string;
};

const EMPTY_FORM: ProductForm = {
  slug: "", title: "", description: "", type: "pdf_guide",
  price_zar: "0", cover_url: "", is_published: false, is_free: false,
  sort_order: "0", stripe_price_id: "",
};

const TYPE_OPTIONS = [
  { value: "pdf_guide",     label: "PDF Guide" },
  { value: "course",        label: "Online Course" },
  { value: "software_tool", label: "Tool / Script" },
  { value: "done_for_you",  label: "Done-For-You Pack" },
  { value: "newsletter",    label: "Email Newsletter" },
  { value: "other",         label: "Other" },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.label])
);

function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description,
      type: p.type,
      price_zar: String(p.price_zar),
      cover_url: p.cover_url ?? "",
      is_published: p.is_published,
      is_free: p.is_free,
      sort_order: String(p.sort_order),
      stripe_price_id: p.stripe_price_id ?? "",
    });
    setError("");
    setShowForm(true);
  }

  function f(key: keyof ProductForm, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      price_zar: parseFloat(form.price_zar) || 0,
      cover_url: form.cover_url.trim() || null,
      is_published: form.is_published,
      is_free: form.is_free,
      sort_order: parseInt(form.sort_order) || 0,
      stripe_price_id: form.stripe_price_id.trim() || null,
    };
    const { error: err } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    load();
  }

  async function togglePublished(p: Product) {
    await supabase.from("products").update({ is_published: !p.is_published }).eq("id", p.id);
    load();
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await supabase.from("products").delete().eq("id", p.id);
    load();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your digital product catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-8">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 rounded-md p-1 hover:bg-border"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold">{editing ? "Edit product" : "New product"}</h2>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <input value={form.title} onChange={(e) => { f("title", e.target.value); f("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} required className={INPUT} />
                </Field>
                <Field label="Slug (URL)">
                  <input value={form.slug} onChange={(e) => f("slug", e.target.value)} required className={INPUT} />
                </Field>
              </div>

              <Field label="Description">
                <textarea value={form.description} onChange={(e) => f("description", e.target.value)} required rows={3} className={`${INPUT} resize-none`} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Type">
                  <select value={form.type} onChange={(e) => f("type", e.target.value)} className={INPUT}>
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Price (ZAR)">
                  <input type="number" min="0" step="0.01" value={form.price_zar} onChange={(e) => f("price_zar", e.target.value)} className={INPUT} />
                </Field>
                <Field label="Sort order">
                  <input type="number" value={form.sort_order} onChange={(e) => f("sort_order", e.target.value)} className={INPUT} />
                </Field>
              </div>

              <Field label="Cover image URL (optional)">
                <input value={form.cover_url} onChange={(e) => f("cover_url", e.target.value)} placeholder="https://..." className={INPUT} />
              </Field>

              <Field label="Stripe Price ID (optional — wire up before going live)">
                <input value={form.stripe_price_id} onChange={(e) => f("stripe_price_id", e.target.value)} placeholder="price_..." className={INPUT} />
              </Field>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_free} onChange={(e) => f("is_free", e.target.checked)} className="h-4 w-4 rounded" />
                  Free product
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => f("is_published", e.target.checked)} className="h-4 w-4 rounded" />
                  Published (visible on site)
                </label>
              </div>

              {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary/40">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No products yet. Add your first one.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">/products#{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{TYPE_LABELS[p.type] ?? p.type}</td>
                  <td className="px-4 py-3">
                    {p.is_free ? <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-mono text-green-700">Free</span>
                              : `R${p.price_zar.toLocaleString("en-ZA")}`}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono ${
                        p.is_published
                          ? "border-green-300 bg-green-500/10 text-green-700"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {p.is_published ? <><Eye className="h-3 w-3" />Published</> : <><EyeOff className="h-3 w-3" />Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-md p-1.5 hover:bg-border" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
