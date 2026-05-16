import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/checkout/failed")({
  head: () => ({
    meta: [
      { title: "Payment Failed — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutFailedPage,
});

function CheckoutFailedPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <XCircle className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 font-display text-3xl font-bold">Payment failed</h1>
        <p className="mt-3 text-muted-foreground">
          Your card was not charged. This can happen due to insufficient funds, a declined card, or a network issue.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary/40"
          >
            <ArrowLeft className="h-4 w-4" /> Try again
          </a>
          <a
            href={waLink(`Hi ${SITE.name}, my payment failed and I need help.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
