import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
        const SITE_URL = process.env.SITE_URL ?? "https://www.skcdigital.co.za";

        if (!STRIPE_SECRET_KEY) {
          return Response.json({ error: "Stripe is not configured." }, { status: 500 });
        }

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON." }, { status: 400 });
        }

        const str = (v: unknown, max = 500) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const mode = str(body.mode, 20) as "payment" | "subscription";
        const priceId = str(body.priceId, 200);
        const email = str(body.email, 255);
        const successUrl = `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${SITE_URL}/${mode === "subscription" ? "memberships" : "products"}`;

        if (!priceId || !["payment", "subscription"].includes(mode)) {
          return Response.json({ error: "Missing priceId or invalid mode." }, { status: 400 });
        }

        const stripeBody: Record<string, string> = {
          mode,
          "line_items[0][price]": priceId,
          "line_items[0][quantity]": "1",
          success_url: successUrl,
          cancel_url: cancelUrl,
          "payment_method_types[0]": "card",
        };
        if (email) stripeBody["customer_email"] = email;

        const params = new URLSearchParams(stripeBody);

        const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const session = await res.json() as { id?: string; url?: string; error?: { message: string } };

        if (!res.ok || session.error) {
          return Response.json(
            { error: session.error?.message ?? "Stripe error" },
            { status: res.status }
          );
        }

        return Response.json({ url: session.url, sessionId: session.id });
      },
    },
  },
});
