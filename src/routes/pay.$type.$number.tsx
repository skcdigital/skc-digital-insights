import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { loadPaymentData } from "./pay.$type.$number.server";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/pay/$type/$number")({
  head: () => ({
    meta: [
      { title: "Pay securely — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async ({ params }) => {
    return loadPaymentData({ data: params });
  },
  component: PayPage,
});

function PayPage() {
  const data = Route.useLoaderData();

  useEffect(() => {
    if ("fields" in data && data.fields && data.paymentUrl) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      for (const [key, value] of Object.entries(data.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    }
  }, [data]);

  if ("error" in data) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <p className="font-mono text-sm text-primary">Payment error</p>
          <h1 className="mt-3 text-2xl font-bold">{data.error}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please contact us on{" "}
            <a href="https://wa.me/27673793503" className="text-primary underline">
              WhatsApp
            </a>{" "}
            or email{" "}
            <a href="mailto:info@skcdigital.co.za" className="text-primary underline">
              info@skcdigital.co.za
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-semibold">Redirecting to PayFast…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You are being redirected to the secure PayFast payment page for{" "}
          <strong>R {data.amountZar?.toFixed(2)}</strong>.
        </p>
      </div>
    </div>
  );
}
