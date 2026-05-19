import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export const Route = createFileRoute("/pay/success")({
  head: () => ({
    meta: [
      { title: "Payment received — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaySuccessPage,
});

function PaySuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 font-display text-3xl font-bold">Payment received!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you — your payment has been processed successfully. You will receive a confirmation
          email shortly.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions? WhatsApp us on{" "}
          <a href="https://wa.me/27673793503" className="text-primary underline">
            +27 67 379 3503
          </a>{" "}
          or email{" "}
          <a href="mailto:info@skcdigital.co.za" className="text-primary underline">
            info@skcdigital.co.za
          </a>
          .
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
