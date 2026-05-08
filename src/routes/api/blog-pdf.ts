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

export const Route = createFileRoute("/api/blog-pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
          return Response.json(
            { error: "Email service is not configured." },
            { status: 500 },
          );
        }

        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const str = (v: unknown, max = 500) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const email = str(payload.email, 255);
        const slug = str(payload.slug, 100);
        const postTitle = str(payload.postTitle, 200);
        const pdfBase64 =
          typeof payload.pdfBase64 === "string" ? payload.pdfBase64 : "";

        if (!email || !slug || !postTitle) {
          return Response.json(
            { error: "Email, slug, and postTitle are required." },
            { status: 400 },
          );
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json(
            { error: "Invalid email address." },
            { status: 400 },
          );
        }
        if (!pdfBase64) {
          return Response.json(
            { error: "PDF data is missing." },
            { status: 400 },
          );
        }

        // Save lead (best-effort)
        try {
          await supabaseAdmin.from("leads").insert({
            email,
            message: `Requested blog PDF: ${postTitle}`,
            channel: "blog-pdf",
            status: "new",
          });
        } catch (err) {
          console.error("Lead save failed", err);
        }

        const attachment = {
          filename: `SKC-Digital-Guide-${slug}.pdf`,
          content: pdfBase64,
        };

        const customerHtml = `
          <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6">
            <p>Hi there,</p>
            <p>Here is your free guide from <strong>SKC Digital</strong>: <em>${escapeHtml(postTitle)}</em>.</p>
            <p>The PDF is attached — save it for reference.</p>
            <p style="margin-top:24px">If you have questions or want help putting this into practice, WhatsApp us on <a href="https://wa.me/27673793503">+27 67 379 3503</a> or reply to this email.</p>
            <p style="margin-top:24px">Best regards,<br/>Suzan &mdash; SKC Digital<br/><a href="https://www.skcdigital.co.za">skcdigital.co.za</a></p>
          </div>
        `;

        const res = await fetch(`${RESEND_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SKC Digital <noreply@skcdigital.co.za>",
            to: [email],
            reply_to: "info@skcdigital.co.za",
            subject: `Your free guide: ${postTitle} — SKC Digital`,
            html: customerHtml,
            attachments: [attachment],
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Resend blog-pdf send failed", res.status, data);
          return Response.json(
            { error: "Failed to send email. Please try again." },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
