import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send, Lock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/tickets/$id")({ component: TicketEditorPage });

type FullTicket = {
  id: string;
  number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  subject: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  resolved_at: string | null;
  created_at: string;
};

type Reply = {
  id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-300",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-300",
  resolved: "bg-green-500/10 text-green-700 border-green-300",
  closed: "bg-slate-500/10 text-slate-500 border-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-500 border-slate-300",
  medium: "bg-amber-500/10 text-amber-600 border-amber-300",
  high: "bg-red-400/10 text-red-500 border-red-200",
  urgent: "bg-red-600/10 text-red-700 border-red-400",
};

function TicketEditorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const replyBottomRef = useRef<HTMLDivElement>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("open");

  // Existing ticket + replies
  const [ticket, setTicket] = useState<FullTicket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Reply form state
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!isNew) loadTicket();
  }, [id]);

  async function loadTicket() {
    setLoading(true);
    const { data: tk, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !tk) { setNotFound(true); setLoading(false); return; }
    const { data: tkReplies } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });
    const full = tk as FullTicket;
    setTicket(full);
    setClientName(full.client_name);
    setClientEmail(full.client_email ?? "");
    setClientPhone(full.client_phone ?? "");
    setSubject(full.subject);
    setDescription(full.description ?? "");
    setCategory(full.category ?? "general");
    setPriority(full.priority);
    setStatus(full.status);
    setReplies((tkReplies ?? []) as Reply[]);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) { setSaveError("Client name is required."); return; }
    if (!subject.trim()) { setSaveError("Subject is required."); return; }
    setSaving(true);
    setSaveError("");

    if (isNew) {
      const { data: numData, error: rpcError } = await supabase.rpc("next_document_number", {
        _kind: "ticket",
        _prefix: "SKC-TK",
      });
      if (rpcError || !numData) {
        setSaveError("Failed to generate ticket number. Please try again.");
        setSaving(false);
        return;
      }
      const { data: newTicket, error: insertError } = await supabase
        .from("tickets")
        .insert({
          number: numData as string,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          subject: subject.trim(),
          description: description.trim() || null,
          category,
          priority,
          status,
        })
        .select()
        .single();
      if (insertError || !newTicket) {
        setSaveError("Failed to create ticket. Please try again.");
        setSaving(false);
        return;
      }
      navigate({ to: "/admin/tickets/$id", params: { id: newTicket.id } });
    } else {
      const resolvedAt =
        (status === "resolved" || status === "closed") && ticket?.status !== status
          ? new Date().toISOString()
          : ticket?.resolved_at ?? null;
      await supabase
        .from("tickets")
        .update({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          subject: subject.trim(),
          description: description.trim() || null,
          category,
          priority,
          status,
          resolved_at: resolvedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      await loadTicket();
    }
    setSaving(false);
  }

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSendingReply(true);
    await supabase.from("ticket_replies").insert({
      ticket_id: id,
      content: replyText.trim(),
      is_internal: isInternal,
    });
    setReplyText("");
    setIsInternal(false);
    await loadTicket();
    setSendingReply(false);
    setTimeout(() => replyBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleDelete() {
    if (!confirm("Delete this ticket and all its replies? This cannot be undone.")) return;
    setDeleting(true);
    await supabase.from("tickets").delete().eq("id", id);
    navigate({ to: "/admin/tickets" });
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
        <p className="text-sm text-muted-foreground">Ticket not found.</p>
        <Link to="/admin/tickets" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to tickets
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
            to="/admin/tickets"
            className="rounded-lg border border-border bg-surface p-2 hover:border-primary/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">
              {isNew ? "New Ticket" : ticket?.number}
            </h1>
            {!isNew && ticket && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[ticket.status] ?? "border-border text-muted-foreground"}`}>
                  {ticket.status.replace("_", " ")}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority] ?? "border-border text-muted-foreground"}`}>
                  {ticket.priority}
                </span>
              </div>
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
        {/* Client */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Name *</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@co.za"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Phone</label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+27 XX XXX XXXX"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Ticket details */}
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Ticket Details</h2>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Subject *</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of the issue"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="website">Website</option>
                <option value="bookkeeping">Bookkeeping</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detailed description of the issue…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
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
            {saving ? "Saving…" : isNew ? "Create Ticket" : "Save Changes"}
          </button>
          <Link
            to="/admin/tickets"
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Reply thread — only shown when editing an existing ticket */}
      {!isNew && (
        <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Replies ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No replies yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`rounded-lg border p-3 text-sm ${
                    reply.is_internal
                      ? "border-purple-200 bg-purple-50/60"
                      : "border-green-200 bg-green-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {reply.is_internal ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-purple-600">
                        <Lock className="h-2.5 w-2.5" /> Internal note
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-green-700">Reply</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(reply.created_at).toLocaleString("en-ZA")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                </div>
              ))}
              <div ref={replyBottomRef} />
            </div>
          )}

          {/* Add reply */}
          <div className="border-t border-border pt-4 space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder="Type your reply…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Internal note (not visible to client)
                </span>
              </label>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                {sendingReply ? "Posting…" : "Post Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
