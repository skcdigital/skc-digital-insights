import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, L, LI, Callout } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

const TITLE = "Refund Policy | SKC Digital";
const DESC =
  "When refunds apply, when they don't, and how to request one — clear and fair refund terms for SKC Digital projects and retainers.";

export const Route = createFileRoute("/legal/refund")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/legal/refund` },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      intro={
        <p>
          We want every client to be satisfied. If something isn&apos;t right, contact
          us first — we&apos;ll always try to fix it before a refund is necessary.
        </p>
      }
      sections={[
        {
          id: "commitment",
          title: "Our Commitment",
          body: (
            <>
              <p>SKC Digital is committed to delivering quality work that meets the agreed scope. We operate on a clear quote-first, work-after model — meaning you always know what you&apos;re getting before you pay.</p>
              <p>Our goal is always to resolve any dissatisfaction through revisions before considering a refund. Please communicate any concerns as early as possible.</p>
            </>
          ),
        },
        {
          id: "apply",
          title: "When Refunds Apply",
          body: (
            <>
              <p>You may be eligible for a full or partial refund in the following situations:</p>
              <L>
                <LI><strong>Non-delivery:</strong> We accepted payment but failed to deliver the agreed work within a reasonable timeframe with no communication</LI>
                <LI><strong>Significant deviation:</strong> The delivered work significantly and materially differs from the agreed scope, and we are unable to correct it after two revision attempts</LI>
                <LI><strong>Cancellation before work begins:</strong> You cancel the project before any work has commenced — full deposit refund applies</LI>
                <LI><strong>Duplicate payment:</strong> You accidentally paid twice for the same service</LI>
              </L>
            </>
          ),
        },
        {
          id: "no-apply",
          title: "When Refunds Do Not Apply",
          body: (
            <>
              <p>Refunds will not be issued in the following situations:</p>
              <L>
                <LI>Work has been completed and delivered as per the agreed scope</LI>
                <LI>You change your mind after work has begun</LI>
                <LI>Delays caused by your failure to provide required content or information on time</LI>
                <LI>You provided incorrect information that affected the deliverable</LI>
                <LI>The project was completed and you made changes to it yourself after delivery</LI>
                <LI>Dissatisfaction based on subjective preference after the agreed scope was delivered</LI>
                <LI>Monthly retainer fees already used for the current month</LI>
              </L>
              <Callout tone="warn">Deposits are non-refundable once work has commenced, regardless of the reason for cancellation.</Callout>
            </>
          ),
        },
        {
          id: "revisions",
          title: "Revision Policy",
          body: (
            <>
              <p>Before requesting a refund, clients are encouraged to request revisions. Our revision policy is as follows:</p>
              <L>
                <LI><strong>Once-off projects:</strong> 2 rounds of revisions are included at no extra cost, provided the revision requests fall within the original agreed scope</LI>
                <LI><strong>Monthly retainers:</strong> Unlimited reasonable revisions within the month are included</LI>
                <LI><strong>Out-of-scope changes:</strong> Changes that go beyond the original agreed scope will be quoted separately</LI>
              </L>
              <p>Revision requests must be submitted within 7 days of delivery. After this period, changes may be treated as a new project.</p>
            </>
          ),
        },
        {
          id: "request",
          title: "How to Request a Refund",
          body: (
            <>
              <p>To request a refund, please contact us with the following information:</p>
              <L>
                <LI>Your name and business name</LI>
                <LI>Invoice number or date of payment</LI>
                <LI>Description of the issue and why you believe a refund is warranted</LI>
                <LI>Proof of payment (EFT confirmation)</LI>
              </L>
              <p>Contact us via email at info@skcdigital.co.za with the subject line &ldquo;Refund Request — [Your Name]&rdquo;.</p>
              <p>We will review your request and respond within 3 business days.</p>
            </>
          ),
        },
        {
          id: "processing",
          title: "Refund Processing",
          body: (
            <>
              <p>Approved refunds are processed via EFT to your South African bank account within 5 business days of approval. You will need to provide your banking details for the refund transfer.</p>
              <p>SKC Digital does not charge any processing fees for refunds.</p>
            </>
          ),
        },
        {
          id: "retainer",
          title: "Monthly Retainer Cancellations",
          body: (
            <>
              <p>To cancel a monthly retainer, written notice must be given via email to info@skcdigital.co.za at least 30 days in advance. Fees already charged for the current billing period are non-refundable as services have already been made available for that period.</p>
              <p>Cancellations with less than 30 days notice may still be processed at our discretion, but no refund will be issued for the current month.</p>
            </>
          ),
        },
      ]}
    />
  );
}