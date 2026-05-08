import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Download, Send, Receipt, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateQuoteDocPdf, blobToBase64, downloadBlob } from "@/lib/admin-pdf";
import type { QuoteDoc, DocItem } from "@/lib/admin-pdf";

export const Route = createFileRoute("/admin/quotes/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    leadId: typeof search.leadId === "string" ? search.leadId : undefined,
    client: typeof search.client === "string" ? search.client : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  component: QuoteEditorPage,
});

type LineItem = {
  id?: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type FullQuote = {
  id: string;
  number: string;
  lead_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  issue_date: string;
  valid_until: string | null;
  status: string;
  subtotal: number;
  total: number;
  notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-300",
  sent: "bg-blue-500/10 text-blue-600 border-blue-300",
  accepted: "bg-green-500/10 text-green-700 border-green-300",
  declined: "bg-red-400/10 text-red-500 border-red-200",
  expired: "bg-slate-400/10 text-slate-400 border-slate-200",
};

function today() {
  return new Date().toISOString().split("T")[0];
}
function plus14() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function emptyItem(pos: number): LineItem {
  return { position: pos, description: "", quantity: 1, unit_price: 0, line_total: 0 };
}

function QuoteEditorPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isNew = id === "new";

  // Form state
  const [clientName, setClientName] = useState(search.client ?? "");
  const [clientEmail, setClientEmail] = useState(search.email ?? "");
  const [clientPhone, setClientPhone] = useState(search.phone ?? "");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [validUntil, setValidUntil] = useState(plus14());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem(1)]);

  // Existing quote state
  const [quote, setQuote] = useState<FullQuote | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!isNew) {
      loadQuote();
    }
  }, [id]);

  async function loadQuote() {
    setLoading(true);
    const { data: q, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !q) { setNotFound(true); setLoading(false); return; }
    const { data: qItems } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("position");
    const fullQ = q as FullQuote;
    setQuote(fullQ);
    setClientName(fullQ.client_name);
    setClientEmail(fullQ.client_email ?? "");
    setClientPhone(fullQ.client_phone ?? "");
    setClientAddress(fullQ.client_address ?? "");
    setIssueDate(fullQ.issue_date.split("T")[0]);
    setValidUntil(fullQ.valid_until?.split("T")[0] ?? plus14());
    setNotes(fullQ.notes ?? "");
    setItems((qItems ?? []) as LineItem[]);
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
        _kind: "quote",
        _prefix: "SKC-QT",
      });
      if (rpcError || !numData) {
        setSaveError("Failed to generate quote number. Please try again.");
        setSaving(false);
        return;
      }
      const quoteNumber = numData as string;

      const { data: newQuote, error: insertError } = await supabase
        .from("quotes")
        .insert({
          number: quoteNumber,
          lead_id: search.leadId ?? null,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          client_address: clientAddress.trim() || null,
          issue_date: issueDate,
          valid_until: validUntil || null,
          subtotal,
          total,
          notes: notes.trim() || null,
          status: "draft",
        })
        .select("id")
        .single();

      if (insertError || !newQuote) {
        setSaveError(insertError?.message ?? "Failed to save quote.");
        setSaving(false);
        return;
      }

      const lineItems = items.map((item, i) => ({
        quote_id: newQuote.id,
        position: i + 1,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      }));

      const { error: itemsError } = await supabase.from("quote_items").insert(lineItems);
      if (itemsError) {
        setSaveError(itemsError.message);
        setSaving(false);
        return;
      }

      navigate({ to: "/admin/quotes/$id", params: { id: newQuote.id } });
    } else {
      // Update existing quote
      const { error: updateError } = await supabase
        .from("quotes")
        .update({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          client_address: clientAddress.trim() || null,
          issue_date: issueDate,
          valid_until: validUntil || null,
          subtotal,
          total,
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (updateError) { setSaveError(updateError.message); setSaving(false); return; }

      // Re-insert items
      await supabase.from("quote_items").delete().eq("quote_id", id);
      const lineItems = items.map((item, i) => ({
        quote_id: id,
        position: i + 1,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      }));
      await supabase.from("quote_items").insert(lineItems);
      setActionMsg("Saved!");
      loadQuote();
    }

    setSaving(false);
  }

  async function handleDownload() {
    setActionLoading("dl");
    try {
      const q: QuoteDoc = {
        number: quote?.number ?? "DRAFT",
        issue_date: issueDate,
        valid_until: validUntil,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        client_address: clientAddress || null,
        notes: notes || null,
        subtotal,
        total,
      };
      const blob = await generateQuoteDocPdf(q, items as DocItem[]);
      downloadBlob(blob, `SKC-Quote-${quote?.number ?? "DRAFT"}.pdf`);
    } finally {
      setActionLoading("");
    }
  }

  async function handleSendToClient() {
    if (!clientEmail) { setActionMsg("No client email."); return; }
    if (!quote) return;
    setActionLoading("send");
    setActionMsg("");
    try {
      const q: QuoteDoc = {
        number: quote.number,
        issue_date: issueDate,
        valid_until: validUntil,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        client_address: clientAddress || null,
        notes: notes || null,
        subtotal,
        total,
      };
      const blob = await generateQuoteDocPdf(q, items as DocItem[]);
      const pdfBase64 = await blobToBase64(blob);
      const res = await fetch("/api/send-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          clientName,
          clientEmail,
          docNumber: quote.number,
          pdfBase64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Send failed");
      await supabase.from("quotes").update({ status: "sent" }).eq("id", quote.id);
      setActionMsg("Quote sent!");
      loadQuote();
    } catch (err: unknown) {
      setActionMsg(err instanceof Error ? err.message : "Send failed");
    } finally {
      setActionLoading("");
    }
  }

  async function updateQuoteStatus(status: string) {
    if (!quote) return;
    await supabase.from("quotes").update({ status: status as "accepted" | "declined" | "sent" | "draft" | "expired" }).eq("id", quote.id);
    setActionMsg(`Marked as ${status}`);
    loadQuote();
  }

  if (loading) {
    return (
      <div className="pb-20 lg:pb-6">
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4 pb-20 lg:pb-6">
        <Link to="/admin/quotes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to quotes
        </Link>
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Quote not found.</p>
      </div>
    );
  }

  const isDraft = isNew || quote?.status === "draft";

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/quotes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to quotes
          </Link>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {isNew ? "New quote" : quote?.number}
          </h1>
          {!isNew && quote && (
            <p className="mt-1 text-sm text-muted-foreground">
              {quote.client_name} · {new Date(quote.issue_date).toLocaleDateString("en-ZA")}
            </p>
          )}
        </div>
        {!isNew && quote && (
          <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ${STATUS_COLORS[quote.status] ?? "border-border text-muted-foreground"}`}>
            {quote.status}
          </span>
        )}
      </div>

      {/* Action bar for existing quotes */}
      {!isNew && quote && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/40 p-3">
          <button
            onClick={handleDownload}
            disabled={actionLoading === "dl"}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            {actionLoading === "dl" ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={handleSendToClient}
            disabled={actionLoading === "send" || !clientEmail}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {actionLoading === "send" ? "Sending…" : "Send to client"}
          </button>
          <Link
            to="/admin/invoices/$id"
            params={{ id: "new" }}
            search={{ quoteId: quote.id } as Record<string, string>}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40 transition-colors"
          >
            <Receipt className="h-4 w-4" /> Convert to invoice
          </Link>
          {quote.status !== "accepted" && (
            <button
              onClick={() => updateQuoteStatus("accepted")}
              className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-500/10 px-3 py-2 text-sm text-green-700 hover:bg-green-500/20 transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Mark accepted
            </button>
          )}
          {quote.status !== "declined" && (
            <button
              onClick={() => updateQuoteStatus("declined")}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-400/10 px-3 py-2 text-sm text-red-500 hover:bg-red-400/20 transition-colors"
            >
              <XCircle className="h-4 w-4" /> Mark declined
            </button>
          )}
          {actionMsg && (
            <span className={`ml-auto text-sm font-medium ${actionMsg.includes("!") && !actionMsg.toLowerCase().includes("fail") ? "text-green-600" : "text-red-500"}`}>
              {actionMsg}
            </span>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {saveError && (
          <p className="rounded-md bg-red-500/10 border border-red-300 px-3 py-2 text-sm text-red-600">{saveError}</p>
        )}

        {/* Client info */}
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <h2 className="mb-4 font-display text-base font-bold">Client information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client name *</label>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={!isDraft}
                placeholder="Acme Corp"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={!isDraft}
                placeholder="client@example.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Phone</label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                disabled={!isDraft}
                placeholder="+27 82 000 0000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Address</label>
              <input
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                disabled={!isDraft}
                placeholder="123 Main St, Pretoria"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Issue date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={!isDraft}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Valid until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                disabled={!isDraft}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold">Line items</h2>
            {isDraft && (
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add line
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-8">#</th>
                  <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-16">Qty</th>
                  <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-28">Unit price (R)</th>
                  <th className="pb-2 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-24">Total (R)</th>
                  {isDraft && <th className="w-8" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-2 text-muted-foreground">{item.position}</td>
                    <td className="py-2 pr-2">
                      {isDraft ? (
                        <input
                          required
                          value={item.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          placeholder="Service description"
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      ) : (
                        <span>{item.description}</span>
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      {isDraft ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      {isDraft ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      ) : (
                        <span>{Number(item.unit_price).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
                      )}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {Number(item.line_total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </td>
                    {isDraft && (
                      <td className="py-2 pl-2">
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          disabled={items.length === 1}
                          className="rounded-md p-1 text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={isDraft ? 4 : 3} className="pt-3 text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">Subtotal</td>
                  <td className="pt-3 text-right font-semibold">R {subtotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  {isDraft && <td />}
                </tr>
                <tr>
                  <td colSpan={isDraft ? 4 : 3} className="pt-1 text-right font-mono text-xs uppercase tracking-wider text-primary font-bold">Total</td>
                  <td className="pt-1 text-right font-bold text-primary">R {total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  {isDraft && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <label className="mb-2 block font-display text-base font-bold">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isDraft}
            placeholder="Payment terms, special conditions, thank you note…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-60"
          />
        </div>

        {/* Save button */}
        {isDraft && (
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : isNew ? "Save as draft" : "Save changes"}
            </button>
            {actionMsg && !isNew && (
              <span className={`text-sm font-medium ${actionMsg === "Saved!" ? "text-green-600" : "text-red-500"}`}>{actionMsg}</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
