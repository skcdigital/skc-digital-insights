import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, Phone, Mail, StickyNote, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/leads/$id")({ component: LeadDetailPage });

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  budget: string | null;
  deadline: string | null;
  message: string | null;
  channel: string;
  status: string;
  estimated_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Activity = {
  id: string;
  lead_id: string;
  kind: string;
  content: string | null;
  created_at: string;
};

type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

const STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-300",
  contacted: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
  quoted: "bg-purple-500/10 text-purple-600 border-purple-300",
  won: "bg-green-500/10 text-green-700 border-green-300",
  lost: "bg-red-400/10 text-red-500 border-red-200",
};

const ACTIVITY_KINDS = ["note", "call", "whatsapp", "email", "status"];

function activityIcon(kind: string) {
  switch (kind) {
    case "call": return <Phone className="h-3.5 w-3.5" />;
    case "whatsapp": return <MessageSquare className="h-3.5 w-3.5" />;
    case "email": return <Mail className="h-3.5 w-3.5" />;
    case "status": return <CheckCircle2 className="h-3.5 w-3.5" />;
    default: return <StickyNote className="h-3.5 w-3.5" />;
  }
}

function LeadDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Activity form
  const [actKind, setActKind] = useState("note");
  const [actContent, setActContent] = useState("");
  const [loggingActivity, setLoggingActivity] = useState(false);

  // Notes edit
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  async function loadLead() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setLead(data as Lead);
    setNotesValue(data.notes ?? "");
    setLoading(false);
  }

  async function loadActivities() {
    const { data } = await supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });
    setActivities((data as Activity[]) ?? []);
  }

  useEffect(() => {
    loadLead();
    loadActivities();
  }, [id]);

  async function updateStatus(status: LeadStatus) {
    if (!lead) return;
    await supabase.from("leads").update({ status }).eq("id", lead.id);
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      kind: "status",
      content: `Status changed to "${status}"`,
    });
    setLead((prev) => prev ? { ...prev, status } : prev);
    loadActivities();
  }

  async function logActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!lead || !actContent.trim()) return;
    setLoggingActivity(true);
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      kind: actKind,
      content: actContent.trim(),
    });
    setActContent("");
    setLoggingActivity(false);
    loadActivities();
  }

  async function saveNotes() {
    if (!lead) return;
    setSavingNotes(true);
    await supabase.from("leads").update({ notes: notesValue }).eq("id", lead.id);
    setLead((prev) => prev ? { ...prev, notes: notesValue } : prev);
    setSavingNotes(false);
    setEditingNotes(false);
  }

  if (loading) {
    return (
      <div className="pb-20 lg:pb-6">
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="pb-20 lg:pb-6 space-y-4">
        <Link to="/admin/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to leads
        </Link>
        <p className="rounded-xl border border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">Lead not found.</p>
      </div>
    );
  }

  const currentStatusIndex = STATUSES.indexOf(lead.status as LeadStatus);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Back link */}
      <Link to="/admin/leads" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.service ?? "No service specified"} · via {lead.channel} · {new Date(lead.created_at).toLocaleDateString("en-ZA")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider ${STATUS_COLORS[lead.status] ?? "border-border text-muted-foreground"}`}>
          {lead.status}
        </span>
      </div>

      {/* Status pipeline */}
      <div className="rounded-xl border border-border bg-surface/40 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pipeline</p>
        <div className="flex items-center gap-0">
          {STATUSES.map((s, i) => {
            const isActive = s === lead.status;
            const isPast = i < currentStatusIndex;
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className="group relative flex flex-1 flex-col items-center"
              >
                <div className={`flex h-8 w-full items-center justify-center text-[11px] font-mono uppercase tracking-wider transition-all border-y ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isPast
                    ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    : "bg-surface text-muted-foreground border-border hover:bg-surface/60"
                } ${i === 0 ? "rounded-l-lg border-l" : ""} ${i === STATUSES.length - 1 ? "rounded-r-lg border-r" : "border-r"}`}>
                  {isActive ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Circle className="mr-1 h-3 w-3 opacity-40" />}
                  <span className="hidden sm:inline">{s}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Lead info card */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-display text-base font-bold">Lead information</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Email", lead.email],
                ["Phone", lead.phone],
                ["Service", lead.service],
                ["Budget", lead.budget],
                ["Deadline", lead.deadline],
                ["Channel", lead.channel],
                ["Estimated value", lead.estimated_value != null ? `R ${Number(lead.estimated_value).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : null],
                ["Last updated", new Date(lead.updated_at).toLocaleDateString("en-ZA")],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-sm">{value ?? <span className="text-muted-foreground">—</span>}</dd>
                </div>
              ))}
            </dl>

            {lead.message && (
              <div className="mt-4 border-t border-border pt-4">
                <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Message</dt>
                <dd className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{lead.message}</dd>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold">Internal notes</h2>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="rounded-md border border-border px-3 py-1 text-xs hover:border-primary/40 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add private notes about this lead…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {savingNotes ? "Saving…" : "Save notes"}
                  </button>
                  <button
                    onClick={() => { setEditingNotes(false); setNotesValue(lead.notes ?? ""); }}
                    className="rounded-lg border border-border px-4 py-1.5 text-sm hover:border-primary/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {lead.notes?.trim() || <span className="italic">No notes yet. Click Edit to add one.</span>}
              </p>
            )}
          </div>

          {/* Log activity form */}
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-display text-base font-bold">Log activity</h2>
            <form onSubmit={logActivity} className="space-y-3">
              <div className="flex gap-2">
                {(["note", "call", "whatsapp", "email"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActKind(k)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                      actKind === k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {activityIcon(k)}
                    {k}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                value={actContent}
                onChange={(e) => setActContent(e.target.value)}
                placeholder={`What happened on this ${actKind}…`}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <button
                type="submit"
                disabled={loggingActivity || !actContent.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {loggingActivity ? "Logging…" : "Log activity"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-3 font-display text-base font-bold">Actions</h2>
            <div className="space-y-2">
              <Link
                to="/admin/quotes/$id"
                params={{ id: "new" }}
                search={{
                  leadId: lead.id,
                  client: lead.name,
                  email: lead.email ?? "",
                  phone: lead.phone ?? "",
                } as Record<string, string>}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Create quote from this lead
              </Link>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h2 className="mb-4 font-display text-base font-bold">Timeline</h2>
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            )}
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
                    {activityIcon(act.kind)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-primary">{act.kind}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(act.created_at).toLocaleString("en-ZA")}</span>
                    </div>
                    {act.content && (
                      <p className="mt-0.5 text-sm text-muted-foreground whitespace-pre-wrap">{act.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
