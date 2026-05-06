import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, L, LI, Callout } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

const TITLE = "Terms & Conditions | SKC Digital";
const DESC =
  "Terms and conditions governing all SKC Digital services — payment, delivery, intellectual property, cancellations and governing law.";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/legal/terms` },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of Terms",
          body: (
            <>
              <p>
                By engaging SKC Digital (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) for any service —
                whether via WhatsApp, email, or our website skcdigital.co.za — you
                (&ldquo;the Client&rdquo;) agree to be bound by these Terms and Conditions.
                Please read them carefully before proceeding with any order.
              </p>
              <p>If you do not agree to these terms, please do not proceed with any service request.</p>
            </>
          ),
        },
        {
          id: "services",
          title: "Services Provided",
          body: (
            <>
              <p>SKC Digital offers the following digital and IT services to South African small and medium businesses:</p>
              <L>
                <LI>Custom Excel spreadsheet design and automation</LI>
                <LI>Website design and development</LI>
                <LI>Monthly bookkeeping and financial record cleanup</LI>
                <LI>Business process automation</LI>
                <LI>Digital setup and consulting</LI>
                <LI>Invoice and quote template design</LI>
                <LI>Website care and maintenance plans</LI>
              </L>
              <p>All services are delivered remotely via WhatsApp and email. No physical meetings are required or offered unless explicitly agreed upon in writing.</p>
              <Callout>All services are scoped and agreed upon before work begins. No work starts without client approval of the quote.</Callout>
            </>
          ),
        },
        {
          id: "payment",
          title: "Payment Terms",
          body: (
            <>
              <h3 className="font-semibold text-foreground">Once-off projects</h3>
              <p>For projects priced under R500, full payment is required before work begins. For projects priced at R500 or above, a 50% deposit is required upfront, with the remaining 50% due upon delivery.</p>
              <h3 className="font-semibold text-foreground">Monthly retainers</h3>
              <p>Monthly retainer fees are due at the start of each month. Failure to pay within 7 days of the due date may result in suspension of services until payment is received.</p>
              <h3 className="font-semibold text-foreground">Payment method</h3>
              <p>Payment is accepted via EFT (Electronic Funds Transfer) to our South African bank account. Banking details will be provided on the invoice. Please use your invoice number as the payment reference.</p>
              <Callout tone="warn">Work will not commence or be delivered until the required payment or deposit has been confirmed. SKC Digital reserves the right to withhold final deliverables until full payment is received.</Callout>
            </>
          ),
        },
        {
          id: "delivery",
          title: "Delivery & Turnaround",
          body: (
            <>
              <p>SKC Digital aims to deliver most once-off projects within 24–48 hours of confirmed payment. Larger or more complex projects will have a timeline communicated clearly before work begins.</p>
              <p>Delivery timelines are estimates based on normal circumstances. Delays caused by the client (e.g. late provision of required content, slow communication, delayed payment) are not the responsibility of SKC Digital.</p>
              <p>All deliverables are sent via WhatsApp or email in the agreed file format (e.g. .xlsx, .html, .pdf).</p>
            </>
          ),
        },
        {
          id: "client",
          title: "Client Responsibilities",
          body: (
            <>
              <p>The client agrees to:</p>
              <L>
                <LI>Provide accurate, complete, and timely information required to complete the project</LI>
                <LI>Respond to queries within a reasonable time to avoid project delays</LI>
                <LI>Review and approve deliverables promptly upon receipt</LI>
                <LI>Not use any deliverable for illegal, fraudulent, or harmful purposes</LI>
                <LI>Ensure all content provided (logos, text, images) is legally owned or licensed by the client</LI>
              </L>
              <p>SKC Digital is not liable for errors or delays resulting from incomplete or inaccurate information provided by the client.</p>
            </>
          ),
        },
        {
          id: "ip",
          title: "Intellectual Property",
          body: (
            <>
              <p>Upon receipt of full payment, the client is granted full ownership of the final deliverable for their own business use. This includes spreadsheets, website files, templates, and any other custom-built tools.</p>
              <p>SKC Digital retains the right to display completed work in its portfolio and demo materials (without revealing confidential client data) unless the client requests otherwise in writing.</p>
              <p>Any base frameworks, code libraries, or template structures used in building deliverables remain the intellectual property of their respective creators. Only the custom work built for the client is transferred.</p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Limitation of Liability",
          body: (
            <>
              <p>SKC Digital provides services in good faith and to the best of its ability. However, we are not liable for:</p>
              <L>
                <LI>Any financial loss resulting from the use or misuse of our deliverables</LI>
                <LI>Data loss caused by third-party platforms (e.g. Vercel, Google, Microsoft)</LI>
                <LI>Errors introduced by the client after delivery</LI>
                <LI>Downtime or issues caused by hosting providers outside our control</LI>
                <LI>Any indirect, incidental, or consequential damages</LI>
              </L>
              <p>Our total liability in any case is limited to the amount paid by the client for the specific service in question.</p>
            </>
          ),
        },
        {
          id: "cancellations",
          title: "Cancellations",
          body: (
            <>
              <p>If a client cancels a project after work has begun, the deposit paid is non-refundable. If no work has commenced, a full refund of the deposit will be issued within 5 business days.</p>
              <p>SKC Digital reserves the right to cancel any project at any time if the client is found to be acting in bad faith, providing false information, or requesting services that violate any law.</p>
              <p>For monthly retainer clients, cancellation requires 30 days written notice via email to info@skcdigital.co.za.</p>
            </>
          ),
        },
        {
          id: "law",
          title: "Governing Law",
          body: (
            <>
              <p>These Terms and Conditions are governed by the laws of the Republic of South Africa. Any disputes arising from these terms shall be subject to the jurisdiction of the South African courts.</p>
              <p>We encourage clients to contact us directly to resolve any disputes informally before pursuing formal legal action.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <>
              <p>For any questions regarding these Terms and Conditions, please contact us:</p>
              <L>
                <LI>Email: info@skcdigital.co.za</LI>
                <LI>WhatsApp: +27 67 379 3503</LI>
                <LI>Website: skcdigital.co.za</LI>
                <LI>Location: Pretoria, Gauteng, South Africa</LI>
              </L>
            </>
          ),
        },
      ]}
    />
  );
}