import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, ArrowRight, Download } from "lucide-react";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 font-display text-3xl font-bold">Payment successful!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for your purchase. You'll receive a confirmation email shortly with your
          download link or access details.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If you don't receive it within a few minutes, check your spam folder or{" "}
          <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary/40"
          >
            <Download className="h-4 w-4" /> Browse more products
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back to home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
