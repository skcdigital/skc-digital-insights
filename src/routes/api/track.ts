import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const str = (v: unknown, max = 500) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const source  = str(payload.source, 100);
        const service = str(payload.service, 100);
        const message = str(payload.message, 500);
        const name    = str(payload.name, 100)  || "Website Visitor";
        const email   = str(payload.email, 255) || null;
        const phone   = str(payload.phone, 50)  || null;

        const categoryMap: Record<string, string> = {
          "services/excel":       "technical",
          "services/web":         "website",
          "services/bookkeeping": "bookkeeping",
          "services/automation":  "technical",
          "services/consulting":  "general",
          pricing:                "billing",
          "care-plans":           "billing",
          fab:                    "general",
          hero:                   "general",
          contact:                "general",
          audit:                  "general",
        };
        const category = categoryMap[source] || "general";
        const urgent   = /urgent|asap|today|this week/i.test(message);
        const priority = urgent ? "high" : "medium";
        const subject  = service
          ? `WhatsApp enquiry — ${service}`
          : `WhatsApp click — ${source || "website"}`;

        // Save lead
        let lead: { id: string } | null = null;
        try {
          const { data } = await supabaseAdmin
            .from("leads")
            .insert({
              name,
              email,
              phone,
              service: service || null,
              message: message || null,
              channel: "whatsapp",
              status:  "new",
            })
            .select("id")
            .single();
          lead = data as { id: string } | null;
        } catch { /* best-effort */ }

        // Save ticket
        const number = await nextTicketNumber();
        let ticketId: string | undefined;
        try {
          const { data: ticket } = await supabaseAdmin
            .from("tickets")
            .insert({
              number,
              lead_id:      lead?.id ?? null,
              client_name:  name,
              client_email: email,
              client_phone: phone,
              subject,
              description:  message || `WhatsApp click from ${source}`,
              status:       "open",
              priority,
              category,
            })
            .select("id")
            .single();
          ticketId = (ticket as { id: string } | null)?.id;
        } catch { /* best-effort */ }

        return Response.json({ ok: true, ticketId });
      },
    },
  },
});

async function nextTicketNumber(): Promise<string> {
  const { data } = await supabaseAdmin
    .from("doc_counters")
    .select("last_number")
    .eq("kind", "ticket")
    .single();
  const next = (data?.last_number ?? 0) + 1;
  await supabaseAdmin
    .from("doc_counters")
    .upsert({ kind: "ticket", last_number: next });
  return `SKC-TK-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
}
