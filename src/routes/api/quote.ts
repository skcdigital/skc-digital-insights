import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RESEND_URL = "https://api.resend.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const str = (v: unknown, max = 2000) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const name = str(payload.name, 100);
        const email = str(payload.email, 255);
        const service = str(payload.service, 100);
        const budget = str(payload.budget, 100);
        const deadline = str(payload.deadline, 100);
        const message = str(payload.message, 2000);
        const pdfBase64 =
          typeof payload.pdfBase64 === "string" ? payload.pdfBase64 : "";

        if (!name || !email || !service || !budget || !deadline || !message) {
          return Response.json(
            { error: "All fields are required." },
            { status: 400 },
          );
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "Invalid email address." }, { status: 400 });
        }

        // Save lead + ticket first (always attempt, regardless of email config)
        try {
          const { data: lead } = await supabaseAdmin
            .from("leads")
            .insert({ name, email, service, budget, deadline, message, channel: "form", status: "new" })
            .select("id")
            .single();

          const priority =
            deadline === "This week" ? "high" :
            deadline === "Within 2 weeks" ? "medium" : "low";

          const categoryMap: Record<string, string> = {
            "Website": "website",
            "Bookkeeping setup": "bookkeeping",
            "Excel/automation": "technical",
            "Business Process Automation": "technical",
            "Google Business Profile": "general",
            "Care plan": "billing",
          };

          const { data: counter } = await supabaseAdmin
            .from("doc_counters").select("last_number").eq("kind", "ticket").single();
          const next = (counter?.last_number ?? 0) + 1;
          await supabaseAdmin.from("doc_counters").upsert({ kind: "ticket", last_number: next });
          const ticketNumber = `SKC-TK-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;

          await supabaseAdmin.from("tickets").insert({
            number:       ticketNumber,
            lead_id:      lead?.id ?? null,
            client_name:  name,
            client_email: email,
            subject:      `Quote request — ${service}`,
            description:  `Budget: ${budget}\nDeadline: ${deadline}\n\n${message}`,
            status:       "open",
            priority,
            category:     categoryMap[service] ?? "general",
          });
        } catch (err) {
          console.error("Lead/ticket save failed", err);
        }

        // If no Resend key, lead is still saved — return success without email
        if (!RESEND_API_KEY) {
          return Response.json({ ok: true, emailSent: false });
        }

        const internalSubject = `New quote request — ${name} (${service})`;
        const internalHtml = `
          <h2>New quote request from skcdigital.co.za</h2>
          <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
            <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
            <tr><td><strong>Service</strong></td><td>${escapeHtml(service)}</td></tr>
            <tr><td><strong>Budget</strong></td><td>${escapeHtml(budget)}</td></tr>
            <tr><td><strong>Deadline</strong></td><td>${escapeHtml(deadline)}</td></tr>
          </table>
          <h3 style="font-family:Arial,sans-serif">Project details</h3>
          <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(message)}</p>
        `;

        const attachments = pdfBase64
          ? [
              {
                filename: `SKC-Digital-Quote-${name.replace(/\s+/g, "-")}.pdf`,
                content: pdfBase64,
              },
            ]
          : undefined;

        // 1. Send the lead notification to SKC Digital (with PDF copy)
        const internalRes = await fetch(`${RESEND_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SKC Digital <noreply@skcdigital.co.za>",
            to: ["info@skcdigital.co.za"],
            reply_to: email,
            subject: internalSubject,
            html: internalHtml,
            attachments,
          }),
        });

        const internalData = await internalRes.json().catch(() => ({}));
        if (!internalRes.ok) {
          console.error("Resend internal send failed", internalRes.status, internalData);
          return Response.json(
            { error: "Failed to send email. Please WhatsApp us instead." },
            { status: 502 },
          );
        }

        // 2. Send confirmation + PDF receipt to the customer
        const customerHtml = `
          <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thanks for reaching out to <strong>SKC Digital</strong>. We have received your quote request and a copy is attached as a PDF for your records.</p>
            <p>We&rsquo;ll reply on WhatsApp or by email within <strong>4 working hours</strong> with a fixed quote and timeline.</p>
            <p style="margin-top:24px">If you need anything urgent, WhatsApp us on <a href="https://wa.me/27673793503">+27 67 379 3503</a>.</p>
            <p style="margin-top:24px">Best regards,<br/>Suzan &mdash; SKC Digital<br/><a href="https://www.skcdigital.co.za">skcdigital.co.za</a></p>
          </div>
        `;
        await fetch(`${RESEND_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SKC Digital <noreply@skcdigital.co.za>",
            to: [email],
            reply_to: "info@skcdigital.co.za",
            subject: "We received your quote request — SKC Digital",
            html: customerHtml,
            attachments,
          }),
        }).catch((err) => console.error("Customer confirmation failed", err));

        return Response.json({ ok: true });
      },
    },
  },
});