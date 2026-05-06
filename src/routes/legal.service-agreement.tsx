import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, L, LI, Callout } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

const TITLE = "Service Agreement | SKC Digital";
const DESC =
  "The full service agreement governing all SKC Digital projects — scope, process, fees, timelines, ownership, confidentiality and termination.";

export const Route = createFileRoute("/legal/service-agreement")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/legal/service-agreement` },
    ],
  }),
  component: ServiceAgreementPage,
});

function ServiceAgreementPage() {
  return (
    <LegalLayout
      title="Service Agreement"
      intro={
        <p>
          This Service Agreement applies to all projects undertaken by SKC Digital.
          By proceeding with a project after receiving a quote, the client agrees
          to the terms below.
        </p>
      }
      sections={[
        {
          id: "parties",
          title: "Parties",
          body: (
            <>
              <p><strong>Service Provider:</strong> SKC Digital, operated by Suzan Kwinika, based in Pretoria, Gauteng, South Africa. Contact: info@skcdigital.co.za · +27 67 379 3503 · skcdigital.co.za</p>
              <p><strong>Client:</strong> Any individual or business entity that engages SKC Digital for services via WhatsApp, email, or the website skcdigital.co.za.</p>
            </>
          ),
        },
        {
          id: "scope",
          title: "Scope of Work",
          body: (
            <>
              <p>The scope of each project is defined by the written quote provided by SKC Digital prior to commencement. The quote will include:</p>
              <L>
                <LI>A description of the deliverable(s)</LI>
                <LI>The agreed price</LI>
                <LI>The estimated delivery timeframe</LI>
                <LI>Any specific requirements or limitations</LI>
              </L>
              <p>Work outside the agreed scope will not be carried out without a revised quote and client approval. Any verbal agreements that are not confirmed in writing (via WhatsApp or email) are not binding.</p>
              <Callout>Always confirm your project scope in writing via WhatsApp or email before making payment.</Callout>
            </>
          ),
        },
        {
          id: "process",
          title: "Project Process",
          body: (
            <>
              <p>All SKC Digital projects follow this standard process:</p>
              <L>
                <LI><strong>Enquiry:</strong> Client contacts SKC Digital via WhatsApp or email describing their needs</LI>
                <LI><strong>Quote:</strong> SKC Digital provides a written quote within 24 hours</LI>
                <LI><strong>Approval:</strong> Client approves the quote in writing</LI>
                <LI><strong>Payment:</strong> Required deposit or full payment is made via EFT</LI>
                <LI><strong>Delivery:</strong> SKC Digital delivers the completed work within the agreed timeframe</LI>
                <LI><strong>Review:</strong> Client reviews and requests any revisions within 7 days</LI>
                <LI><strong>Final payment:</strong> Remaining balance (if any) is paid and project is closed</LI>
              </L>
            </>
          ),
        },
        {
          id: "fees",
          title: "Fees & Payment",
          body: (
            <>
              <p>All fees are quoted and charged in South African Rand (ZAR). Pricing is as indicated on our website and confirmed in the project quote.</p>
              <h3 className="font-semibold text-foreground">Payment schedule</h3>
              <L>
                <LI>Projects under R500: 100% upfront before work begins</LI>
                <LI>Projects R500 and above: 50% deposit upfront, 50% on delivery</LI>
                <LI>Monthly retainers: Full monthly fee due at the start of each month</LI>
              </L>
              <h3 className="font-semibold text-foreground">Late payment</h3>
              <p>If final payment is not received within 7 days of delivery, SKC Digital reserves the right to withhold the final deliverable file until payment is confirmed. For monthly retainers, services will be paused after 7 days of non-payment.</p>
            </>
          ),
        },
        {
          id: "timelines",
          title: "Timelines",
          body: (
            <>
              <p>SKC Digital will always provide a realistic delivery estimate upfront. Standard turnaround times are:</p>
              <L>
                <LI>Excel templates and tools: 24–48 hours</LI>
                <LI>Invoice and quote templates: 24 hours</LI>
                <LI>Single-page websites: 24–48 hours</LI>
                <LI>Multi-page websites: 3–7 business days (agreed upfront)</LI>
                <LI>Monthly bookkeeping: By the last day of each month</LI>
              </L>
              <p>Timelines begin from the point of confirmed payment, not from the point of enquiry. Delays caused by the client providing content late will extend the delivery timeline accordingly.</p>
            </>
          ),
        },
        {
          id: "revisions",
          title: "Revisions & Changes",
          body: (
            <>
              <p>The following revisions are included at no extra cost:</p>
              <L>
                <LI>Up to 2 rounds of revisions for once-off projects, provided changes fall within the original scope</LI>
                <LI>Revisions must be requested within 7 days of delivery</LI>
              </L>
              <p>The following will be treated as new work and quoted separately:</p>
              <L>
                <LI>Changes that expand the original agreed scope</LI>
                <LI>Revision requests submitted more than 7 days after delivery</LI>
                <LI>Changes to work that the client has already modified themselves</LI>
              </L>
            </>
          ),
        },
        {
          id: "ownership",
          title: "Ownership & Licensing",
          body: (
            <>
              <p>Upon receipt of full and final payment:</p>
              <L>
                <LI>The client receives full ownership of the custom work created for them</LI>
                <LI>The client may use, modify, and distribute the deliverable for their own business purposes</LI>
                <LI>The client may not resell the deliverable as a template or product without written permission from SKC Digital</LI>
              </L>
              <p>SKC Digital retains the right to use screenshots or descriptions of completed work in its portfolio and marketing, unless the client requests confidentiality in writing at the start of the project.</p>
            </>
          ),
        },
        {
          id: "confidentiality",
          title: "Confidentiality",
          body: (
            <>
              <p>SKC Digital treats all client business information as confidential. This includes financial data, business strategy, client lists, and any other sensitive information shared in the course of a project.</p>
              <p>We will not share your confidential business information with any third party without your explicit written consent, except where required by South African law.</p>
              <p>This confidentiality obligation continues after the completion of any project.</p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          body: (
            <>
              <p><strong>By the client:</strong> The client may terminate a project at any time. Deposits paid are non-refundable once work has begun. Any completed portions of the work will be delivered upon receipt of payment for work completed to date.</p>
              <p><strong>By SKC Digital:</strong> We reserve the right to terminate any project if the client acts in bad faith, provides false information, requests illegal content, or repeatedly fails to make payment. In this case, any deposit paid will be refunded minus the cost of work already completed.</p>
              <p><strong>Monthly retainers:</strong> Either party may terminate a monthly retainer with 30 days written notice.</p>
            </>
          ),
        },
        {
          id: "warranties",
          title: "Warranties & Disclaimers",
          body: (
            <>
              <p>SKC Digital warrants that:</p>
              <L>
                <LI>All work is original and created specifically for the client</LI>
                <LI>Deliverables will match the agreed scope as described in the quote</LI>
                <LI>We will conduct ourselves professionally and respond to communication promptly</LI>
              </L>
              <p>SKC Digital does not warrant that:</p>
              <L>
                <LI>Websites will achieve specific search engine rankings or traffic goals</LI>
                <LI>Excel tools will be error-free if the client inputs incorrect data</LI>
                <LI>Third-party services used (e.g. Vercel, WhatsApp) will remain available or unchanged</LI>
              </L>
            </>
          ),
        },
        {
          id: "communication",
          title: "Communication",
          body: (
            <>
              <p>All project communication must be conducted via WhatsApp (+27 67 379 3503) or email (info@skcdigital.co.za). SKC Digital will not be held responsible for missed messages sent through other channels.</p>
              <p><strong>Response times:</strong> We aim to respond to all messages within 4 hours during business hours (Monday–Saturday, 8am–8pm SAST).</p>
            </>
          ),
        },
        {
          id: "agreement",
          title: "Agreement to Terms",
          body: (
            <>
              <p>By approving a quote and making payment, the client confirms that they have read, understood, and agreed to this Service Agreement, as well as our Terms &amp; Conditions, Privacy Policy, and Refund Policy.</p>
              <p>These documents are available at skcdigital.co.za and are incorporated by reference into every project engagement.</p>
              <Callout>This agreement is governed by the laws of the Republic of South Africa. Both parties agree to resolve disputes in good faith before pursuing legal action.</Callout>
            </>
          ),
        },
      ]}
    />
  );
}