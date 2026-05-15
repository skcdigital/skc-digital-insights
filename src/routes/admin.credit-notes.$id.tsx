import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/credit-notes/$id")({ component: CreditNoteEditorPage });

type LineItem = {
  id?: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type FullCreditNote = {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  issue_date: string;
  status: string;
  reason: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-300",
  issued: "bg-purple-500/10 text-purple-600 border-purple-300",
  applied: "bg-green-500/10 text-green-700 border-green-300",
  cancelled: "bg-red-400/10 text-red-500 border-red-200",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function emptyItem(pos: number): LineItem {
  return { position: pos, description: "", quantity: 1, unit_price: 0, line_total: 0 };
}

function CreditNoteEditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [status, setStatus] = useState("draft");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem(1)]);

  const [creditNote, setCreditNote] = useState<FullCreditNote | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isNew) loadCreditNote();
  }, [id]);

  async function loadCreditNote() {
    setLoading(true);
    const { data: cn, error } = await supabase
      .from("credit_notes")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !cn) { setNotFound(true); setLoading(false); return; }
    const { data: cnItems } = await supabase
      .from("credit_note_items")
      .select("*")
      .eq("credit_note_id", id)
      .order("position");
    const full = cn as FullCreditNote;
    setCreditNote(full);
    setClientName(full.client_name);
    setClientEmail(full.client_email ?? "");
    setIssueDate(full.issue_date.split("T")[0]);
    setStatus(full.status);
    setReason(full.reason ?? "");
    setNotes(full.notes ?? "");
    setItems((cnItems ?? []) as LineItem[]);
    setLoading(false);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "unit_price") {
        const qty = field === "quantity" ? Number(value) : Number(item.quantity);
        const price = field === "unit_price" ? Number(value) : Number(item.unit_price);
        updated.line_total = parseFloat((qty * price).toFixed(2));
      }
      return updated;
    }));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem(prev.length + 1)]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, position: i + 1 })));
  }

  const subtotal = parseFloat(items.reduce((s, i) => s + Number(i.line_total), 0).toFixed(2));
  const total = subtotal;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) { setSaveError("Client name is required."); return; }
    if (items.length === 0) { setSaveError("Add at least one line item."); return; }
    setSaving(true);
    setSaveError("");

    if (isNew) {
      const { data: numData, error: rpcError } = await supabase.rpc("next_document_number", {
        _kind: "credit_note",
        _prefix: "SKC-CN",
      });
      if (rpcError || !numData) {
        setSaveError("Failed to generate credit note number. Please try again.");
        setSaving(false);
        return;
      }
      const cnNumber = numData as string;
      const { data: newCN, error: insertError } = await supabase
        .from("credit_notes")
        .insert({
          number: cnNumber,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          issue_date: issueDate,
          status,
          reason: reason.trim() || null,
          notes: notes.trim() || null,
          subtotal,
          total,
        })
        .select()
        .single();
      if (insertError || !newCN) {
        setSaveError("Failed to create credit note. Please try again.");
        setSaving(false);
        return;
      }
      if (items.length > 0) {
        await supabase.from("credit_note_items").insert(
          items.map((item) => ({ ...item, credit_note_id: newCN.id, id: undefined }))
        );
      }
      navigate({ to: "/admin/credit-notes/$id", params: { id: newCN.id } });
    } else {
      await supabase
        .from("credit_notes")
        .update({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          issue_date: issueDate,
          status,
          reason: reason.trim() || null,
          notes: notes.trim() || null,
          subtotal,
          total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      await supabase.from("credit_note_items").delete().eq("credit_note_id", id);
      if (items.length > 0) {
        await supabase.from("credit_note_items").insert(
          items.map((item) => ({ ...item, credit_note_id: id, id: undefined }))
        );
      }
      await loadCreditNote();
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this credit note? This cannot be undone.")) return;
    setDeleting(true);
    await supabase.from("credit_notes").delete().eq("id", id);
    navigate({ to: "/admin/credit-notes" });
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
        <p className="text-sm text-muted-foreground">Credit note not found.</p>
        <Link to="/admin/credit-notes" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to credit notes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/credit-notes"
            className="rounded-lg border border-border bg-surface p-2 hover:border-primary/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              {isNew ? "New Credit Note" : creditNote?.number}
            </h1>
            {!isNew && creditNote && (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider mt-1 ${STATUS_COLORS[creditNote.status] ?? "border-border text-muted-foreground"}`}>
                {creditNote.status}
              </span>
            )}
          </div>
        </div>
        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Client details */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client Name *</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@co.za"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Credit note details */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="applied">Applied</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reason for Credit</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Overpayment, service not delivered, etc."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Line Items</h2>
          <div className="hidden grid-cols-[1fr_80px_110px_110px_36px] gap-2 sm:grid">
            {["Description", "Qty", "Unit Price", "Total", ""].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[1fr_80px_110px_110px_36px] sm:items-center sm:border-none sm:bg-transparent sm:p-0">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Service description"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none sm:bg-surface"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none sm:bg-surface"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none sm:bg-surface"
                />
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-sm font-semibold sm:px-2">
                    R {Number(item.line_total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors sm:hidden"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors sm:flex sm:items-center sm:justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add line item
          </button>

          {/* Totals */}
          <div className="ml-auto max-w-xs rounded-lg bg-surface border border-border p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R {subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold">
              <span>Credit Total</span>
              <span>R {total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-2">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {saveError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{saveError}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : isNew ? "Create Credit Note" : "Save Changes"}
          </button>
          <Link
            to="/admin/credit-notes"
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
