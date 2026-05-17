import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RESEND_URL = "https://api.resend.com";
const FROM = "SKC Digital <noreply@skcdigital.co.za>";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/audit-booking")({
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

        const str = (v: unknown, max = 500) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const name      = str(payload.name, 100);
        const email     = str(payload.email, 255);
        const phone     = str(payload.phone, 30);
        const bizType   = str(payload.bizType, 100);
        const challenge = str(payload.challenge, 200);
        const extra     = str(payload.extra, 1000);

        if (!name || !email || !phone || !bizType || !challenge) {
          return Response.json({ error: "All fields are required." }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "Invalid email address." }, { status: 400 });
        }

        const message = [
          `Business type: ${bizType}`,
          `Biggest challenge: ${challenge}`,
          extra ? `Extra info: ${extra}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        // Save lead + create ticket
        try {
          const { data: lead } = await supabaseAdmin
            .from("leads")
            .insert({
              name,
              email,
              phone,
              service: "Free Digital Audit",
              message,
              channel: "audit",
              status: "new",
            })
            .select("id")
            .single();

          const { data: counter } = await supabaseAdmin
            .from("doc_counters")
            .select("last_number")
            .eq("kind", "ticket")
            .single();
          const next = (counter?.last_number ?? 0) + 1;
          await supabaseAdmin
            .from("doc_counters")
            .upsert({ kind: "ticket", last_number: next });
          const ticketNumber = `SKC-TK-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;

          await supabaseAdmin.from("tickets").insert({
            number:       ticketNumber,
            lead_id:      lead?.id ?? null,
            client_name:  name,
            client_email: email,
            client_phone: phone,
            subject:      `Free audit request — ${bizType}`,
            description:  message,
            status:       "open",
            priority:     "medium",
            category:     "general",
          });
        } catch (err) {
          console.error("Audit booking DB save failed", err);
        }

        // Return success even if email isn't configured
        if (!RESEND_API_KEY) {
          return Response.json({ ok: true, emailSent: false });
        }

        async function sendEmail(body: Record<string, unknown>) {
          const r = await fetch(`${RESEND_URL}/emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(body),
          });
          if (!r.ok) console.error("Resend error", r.status, await r.json().catch(() => ({})));
          return r;
        }

        // 1. Notify SKC Digital
        await sendEmail({
          from: FROM,
          to: ["info@skcdigital.co.za"],
          reply_to: email,
          subject: `Free audit request — ${name} (${bizType})`,
          html: `
            <h2 style="font-family:Arial,sans-serif">New free audit request</h2>
            <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
              <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
              <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
              <tr><td><strong>WhatsApp</strong></td><td>${escapeHtml(phone)}</td></tr>
              <tr><td><strong>Business type</strong></td><td>${escapeHtml(bizType)}</td></tr>
              <tr><td><strong>Biggest challenge</strong></td><td>${escapeHtml(challenge)}</td></tr>
              ${extra ? `<tr><td><strong>Extra info</strong></td><td>${escapeHtml(extra)}</td></tr>` : ""}
            </table>
          `,
        });

        // 2. Confirm to the customer
        await sendEmail({
          from: FROM,
          to: [email],
          reply_to: "info@skcdigital.co.za",
          subject: "We received your free audit request — SKC Digital",
          html: `
            <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:560px">
              <p>Hi ${escapeHtml(name)},</p>
              <p>Thanks for booking your <strong>free digital audit</strong> with SKC Digital!</p>
              <p>We&rsquo;ve received your request and will review your Google Business Profile, website, and online presence. You&rsquo;ll hear from us on WhatsApp (<strong>${escapeHtml(phone)}</strong>) within <strong>4 hours</strong> with your personalised action list.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
              <p style="font-size:13px;color:#555">
                <strong>Your details:</strong><br/>
                Business type: ${escapeHtml(bizType)}<br/>
                Challenge: ${escapeHtml(challenge)}
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
              <p>Need something urgently? WhatsApp us at <a href="https://wa.me/27673793503">+27 67 379 3503</a>.</p>
              <p>Best regards,<br/><strong>Suzan — SKC Digital</strong><br/><a href="https://www.skcdigital.co.za">skcdigital.co.za</a></p>
            </div>
          `,
        });

        return Response.json({ ok: true, emailSent: true });
      },
    },
  },
});
