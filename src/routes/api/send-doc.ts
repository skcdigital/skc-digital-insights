import { createFileRoute } from "@tanstack/react-router";

const RESEND_URL = "https://api.resend.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/send-doc")({
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

        const str = (v: unknown, max = 2000) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const type = str(payload.type, 20) as "quote" | "invoice";
        const clientName = str(payload.clientName, 200);
        const clientEmail = str(payload.clientEmail, 255);
        const docNumber = str(payload.docNumber, 50);
        const pdfBase64 = str(payload.pdfBase64, 10_000_000);

        if (!type || !clientName || !clientEmail || !docNumber || !pdfBase64) {
          return Response.json(
            { error: "All fields are required: type, clientName, clientEmail, docNumber, pdfBase64." },
            { status: 400 },
          );
        }

        if (!["quote", "invoice"].includes(type)) {
          return Response.json({ error: "type must be 'quote' or 'invoice'." }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
          return Response.json({ error: "Invalid client email address." }, { status: 400 });
        }

        const isQuote = type === "quote";
        const subject = isQuote
          ? `Your quotation from SKC Digital — ${docNumber}`
          : `Invoice ${docNumber} from SKC Digital`;

        const docLabel = isQuote ? "quotation" : "invoice";
        const filename = isQuote
          ? `SKC-Digital-Quote-${docNumber}.pdf`
          : `SKC-Digital-Invoice-${docNumber}.pdf`;

        const html = `
          <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:600px">
            <div style="background:#1e40af;padding:24px 32px;border-radius:8px 8px 0 0">
              <h1 style="color:#ffffff;margin:0;font-size:20px">SKC Digital</h1>
              <p style="color:#bfdbfe;margin:4px 0 0;font-size:12px">IT solutions built to scale your business</p>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 8px 8px">
              <p>Hi ${escapeHtml(clientName)},</p>
              <p>Please find your ${escapeHtml(docLabel)} <strong>${escapeHtml(docNumber)}</strong> from SKC Digital attached to this email as a PDF.</p>
              ${isQuote
                ? `<p>This quotation is valid for 14 days from the issue date. If you have any questions or would like to proceed, please reply to this email or reach us on WhatsApp at <a href="https://wa.me/27673793503" style="color:#1e40af">+27 67 379 3503</a>.</p>`
                : `<p>Please review the invoice and make payment by the due date indicated. If you have any questions regarding this invoice, please reply to this email or reach us on WhatsApp at <a href="https://wa.me/27673793503" style="color:#1e40af">+27 67 379 3503</a>.</p>`
              }
              <p style="margin-top:28px">Best regards,<br/><strong>Suzan — SKC Digital</strong><br/>
                <a href="https://www.skcdigital.co.za" style="color:#1e40af">skcdigital.co.za</a> &nbsp;·&nbsp;
                <a href="mailto:info@skcdigital.co.za" style="color:#1e40af">info@skcdigital.co.za</a>
              </p>
            </div>
            <p style="font-size:11px;color:#94a3b8;margin-top:16px;text-align:center">
              SKC Digital · Pretoria, South Africa · skcdigital.co.za
            </p>
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
            to: [clientEmail, "info@skcdigital.co.za"],
            reply_to: "info@skcdigital.co.za",
            subject,
            html,
            attachments: [{ filename, content: pdfBase64 }],
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Resend send-doc failed", res.status, data);
          return Response.json(
            { error: "Failed to send email. Please try again or contact us directly." },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
