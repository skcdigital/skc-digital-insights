import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Download, Send, CheckCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoiceDocPdf, blobToBase64, downloadBlob } from "@/lib/admin-pdf";
import type { InvoiceDoc, DocItem } from "@/lib/admin-pdf";

export const Route = createFileRoute("/admin/invoices/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    quoteId: typeof search.quoteId === "string" ? search.quoteId : undefined,
  }),
  component: InvoiceEditorPage,
});

type LineItem = {
  id?: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type FullInvoice = {
  id: string;
  number: string;
  quote_id: string | null;
  lead_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  issue_date: string;
  due_date: string | null;
  status: string;
  subtotal: number;
  total: number;
  amount_paid: number;
  banking_details: string | null;
  notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/10 text-slate-500 border-slate-300",
  sent: "bg-blue-500/10 text-blue-600 border-blue-300",
  paid: "bg-green-500/10 text-green-700 border-green-300",
  overdue: "bg-red-400/10 text-red-500 border-red-200",
  cancelled: "bg-slate-400/10 text-slate-400 border-slate-200",
};

const DEFAULT_BANKING = `Bank: FNB\nAccount: 123456789\nBranch: 250655\nRef: {INV_NUMBER}`;

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

function InvoiceEditorPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(plus14());
  const [bankingDetails, setBankingDetails] = useState(DEFAULT_BANKING);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem(1)]);

  const [invoice, setInvoice] = useState<FullInvoice | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [prefilling, setPrefilling] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Partial payment input
  const [partialAmount, setPartialAmount] = useState("");
  const [showPartial, setShowPartial] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadInvoice();
    } else if (search.quoteId) {
      prefillFromQuote(search.quoteId);
    }
  }, [id]);

  async function prefillFromQuote(quoteId: string) {
    setPrefilling(true);
    const { data: q } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();
    if (q) {
      setClientName(q.client_name ?? "");
      setClientEmail(q.client_email ?? "");
      setClientPhone(q.client_phone ?? "");
      setClientAddress(q.client_address ?? "");
      const { data: qItems } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId)
        .order("position");
      if (qItems && qItems.length > 0) {
        setItems(qItems.map((i, idx) => ({
          position: i.position ?? idx + 1,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          line_total: i.line_total,
        })));
      }
      if (q.notes) setNotes(q.notes);
    }
    setPrefilling(false);
  }

  async function loadInvoice() {
    setLoading(true);
    const { data: inv, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !inv) { setNotFound(true); setLoading(false); return; }
    const { data: invItems } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("position");
    const fullInv = inv as FullInvoice;
    setInvoice(fullInv);
    setClientName(fullInv.client_name);
    setClientEmail(fullInv.client_email ?? "");
    setClientPhone(fullInv.client_phone ?? "");
    setClientAddress(fullInv.client_address ?? "");
    setIssueDate(fullInv.issue_date.split("T")[0]);
    setDueDate(fullInv.due_date?.split("T")[0] ?? plus14());
    setBankingDetails(fullInv.banking_details ?? DEFAULT_BANKING);
    setNotes(fullInv.notes ?? "");
    setItems((invItems ?? []) as LineItem[]);
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
        _kind: "invoice",
        _prefix: "SKC-INV",
      });
      if (rpcError || !numData) {
        setSaveError("Failed to generate invoice number. Please try again.");
        setSaving(false);
        return;
      }
      const invoiceNumber = numData as string;
      const banking = bankingDetails.replace("{INV_NUMBER}", invoiceNumber);

      const { data: newInv, error: insertError } = await supabase
        .from("invoices")
        .insert({
          number: invoiceNumber,
          quote_id: search.quoteId ?? null,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          client_address: clientAddress.trim() || null,
          issue_date: issueDate,
          due_date: dueDate || null,
          subtotal,
          total,
          amount_paid: 0,
          banking_details: banking.trim() || null,
          notes: notes.trim() || null,
          status: "draft",
        })
        .select("id")
        .single();

      if (insertError || !newInv) {
        setSaveError(insertError?.message ?? "Failed to save invoice.");
        setSaving(false);
        return;
      }

      const lineItems = items.map((item, i) => ({
        invoice_id: newInv.id,
        position: i + 1,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(lineItems);
      if (itemsError) { setSaveError(itemsError.message); setSaving(false); return; }

      navigate({ to: "/admin/invoices/$id", params: { id: newInv.id } });
    } else {
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          client_address: clientAddress.trim() || null,
          issue_date: issueDate,
          due_date: dueDate || null,
          subtotal,
          total,
          banking_details: bankingDetails.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("id", id);

      if (updateError) { setSaveError(updateError.message); setSaving(false); return; }

      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      const lineItems = items.map((item, i) => ({
        invoice_id: id,
        position: i + 1,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      }));
      await supabase.from("invoice_items").insert(lineItems);
      setActionMsg("Saved!");
      loadInvoice();
    }

    setSaving(false);
  }

  async function handleDownload() {
    setActionLoading("dl");
    try {
      const inv: InvoiceDoc = {
        number: invoice?.number ?? "DRAFT",
        issue_date: issueDate,
        due_date: dueDate,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        client_address: clientAddress || null,
        notes: notes || null,
        banking_details: bankingDetails || null,
        subtotal,
        total,
        amount_paid: invoice?.amount_paid ?? 0,
      };
      const blob = await generateInvoiceDocPdf(inv, items as DocItem[]);
      downloadBlob(blob, `SKC-Invoice-${invoice?.number ?? "DRAFT"}.pdf`);
    } finally {
      setActionLoading("");
    }
  }

  async function handleSendToClient() {
    if (!clientEmail || !invoice) { setActionMsg("No client email."); return; }
    setActionLoading("send");
    setActionMsg("");
    try {
      const inv: InvoiceDoc = {
        number: invoice.number,
        issue_date: issueDate,
        due_date: dueDate,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        client_address: clientAddress || null,
        notes: notes || null,
        banking_details: bankingDetails || null,
        subtotal,
        total,
        amount_paid: invoice.amount_paid,
      };
      const blob = await generateInvoiceDocPdf(inv, items as DocItem[]);
      const pdfBase64 = await blobToBase64(blob);
      const res = await fetch("/api/send-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "invoice",
          clientName,
          clientEmail,
          docNumber: invoice.number,
          pdfBase64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Send failed");
      await supabase.from("invoices").update({ status: "sent" }).eq("id", invoice.id);
      setActionMsg("Invoice sent!");
      loadInvoice();
    } catch (err: unknown) {
      setActionMsg(err instanceof Error ? err.message : "Send failed");
    } finally {
      setActionLoading("");
    }
  }

  async function markPaid() {
    if (!invoice) return;
    await supabase.from("invoices").update({ status: "paid", amount_paid: invoice.total }).eq("id", invoice.id);
    setActionMsg("Marked as paid!");
    loadInvoice();
  }

  async function handlePartialPayment() {
    if (!invoice) return;
    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0) { setActionMsg("Enter a valid amount."); return; }
    const newPaid = Math.min(Number(invoice.amount_paid) + amount, Number(invoice.total));
    const newStatus = newPaid >= Number(invoice.total) ? "paid" : invoice.status;
    await supabase.from("invoices").update({
      amount_paid: newPaid,
      status: newStatus as "draft" | "sent" | "paid" | "overdue" | "cancelled",
    }).eq("id", invoice.id);
    setPartialAmount("");
    setShowPartial(false);
    setActionMsg(`Payment of R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} recorded!`);
    loadInvoice();
  }

  if (loading || prefilling) {
    return (
      <div className="pb-20 lg:pb-6">
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
          {prefilling ? "Importing quote details…" : "Loading…"}
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4 pb-20 lg:pb-6">
        <Link to="/admin/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  const isDraft = isNew || invoice?.status === "draft";
  const amountPaid = Number(invoice?.amount_paid ?? 0);
  const balance = Number(invoice?.total ?? total) - amountPaid;
  const paymentPct = invoice ? Math.min(100, (amountPaid / Number(invoice.total)) * 100) : 0;

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to invoices
          </Link>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {isNew ? "New invoice" : invoice?.number}
          </h1>
          {!isNew && invoice && (
            <p className="mt-1 text-sm text-muted-foreground">
              {invoice.client_name} · Issued {new Date(invoice.issue_date).toLocaleDateString("en-ZA")}
            </p>
          )}
        </div>
        {!isNew && invoice && (
          <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ${STATUS_COLORS[invoice.status] ?? "border-border text-muted-foreground"}`}>
            {invoice.status}
          </span>
        )}
      </div>

      {/* Payment progress (existing invoices only) */}
      {!isNew && invoice && (
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold">Payment status</h2>
            <span className="font-mono text-xs text-muted-foreground">{paymentPct.toFixed(0)}% paid</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${paymentPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="font-bold">R {Number(invoice.total).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Paid</p>
              <p className="font-bold text-green-700">R {amountPaid.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
              <p className={`font-bold ${balance > 0 ? "text-red-500" : "text-green-700"}`}>
                R {balance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action bar for existing invoices */}
      {!isNew && invoice && (
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
          {invoice.status !== "paid" && (
            <button
              onClick={markPaid}
              className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-500/10 px-3 py-2 text-sm text-green-700 hover:bg-green-500/20 transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Mark paid
            </button>
          )}
          {invoice.status !== "paid" && (
            <button
              onClick={() => setShowPartial((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40 transition-colors"
            >
              <DollarSign className="h-4 w-4" /> Partial payment
            </button>
          )}
          {actionMsg && (
            <span className={`ml-auto text-sm font-medium ${actionMsg.includes("!") && !actionMsg.toLowerCase().includes("fail") ? "text-green-600" : "text-red-500"}`}>
              {actionMsg}
            </span>
          )}
        </div>
      )}

      {/* Partial payment input */}
      {showPartial && invoice && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-4">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Amount (R)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            placeholder="0.00"
            className="w-36 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={handlePartialPayment}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Record
          </button>
          <button
            onClick={() => { setShowPartial(false); setPartialAmount(""); }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/40 transition-colors"
          >
            Cancel
          </button>
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
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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

        {/* Banking details */}
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <label className="mb-2 block font-display text-base font-bold">Banking details</label>
          <textarea
            rows={4}
            value={bankingDetails}
            onChange={(e) => setBankingDetails(e.target.value)}
            disabled={!isDraft}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-60 font-mono"
          />
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <label className="mb-2 block font-display text-base font-bold">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isDraft}
            placeholder="Payment terms, special conditions…"
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
