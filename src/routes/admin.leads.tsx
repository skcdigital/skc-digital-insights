import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

type Lead = { id: string; name: string; email: string | null; phone: string | null; service: string | null; channel: string; status: string; created_at: string; message: string | null };

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    await supabase.from("leads").update({ status: status as "new" | "contacted" | "quoted" | "won" | "lost" }).eq("id", id);
    load();
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <h1 className="font-display text-2xl font-bold">Leads</h1>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && leads.length === 0 && (
        <p className="rounded-xl border border-border bg-surface/40 p-6 text-center text-sm text-muted-foreground">
          No leads yet. Quote-form submissions will appear here automatically.
        </p>
      )}
      <div className="space-y-2">
        {leads.map((l) => (
          <details key={l.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{l.name}</p>
                <p className="truncate text-xs text-muted-foreground">{l.service ?? "—"} · {l.email ?? l.phone ?? "no contact"}</p>
              </div>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase">{l.status}</span>
            </summary>
            <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              {l.message && <p className="whitespace-pre-wrap text-muted-foreground">{l.message}</p>}
              <div className="flex flex-wrap gap-2">
                {["new", "contacted", "quoted", "won", "lost"].map((s) => (
                  <button key={s} onClick={() => setStatus(l.id, s)}
                    className={`rounded-md border px-3 py-1 font-mono text-[11px] uppercase ${l.status === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("en-ZA")}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}