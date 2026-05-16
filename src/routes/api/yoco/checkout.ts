import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const YOCO_API = "https://payments.yoco.com/api";

export const Route = createFileRoute("/api/yoco/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
        const SITE_URL = process.env.SITE_URL ?? "https://www.skcdigital.co.za";

        if (!YOCO_SECRET_KEY) {
          return Response.json({ error: "Payment gateway not configured." }, { status: 500 });
        }

        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON." }, { status: 400 });
        }

        const str = (v: unknown, max = 500) =>
          typeof v === "string" ? v.trim().slice(0, max) : "";

        const type = str(body.type, 20) as "product" | "membership";
        const itemId = str(body.itemId, 100);   // product.id or membership_plan.id
        const email = str(body.email, 255);
        const idempotencyKey = str(body.idempotencyKey, 100);

        if (!type || !itemId) {
          return Response.json({ error: "Missing type or itemId." }, { status: 400 });
        }

        let amountCents: number;
        let label: string;
        let metadata: Record<string, string> = { type, itemId };

        if (type === "product") {
          const { data: product, error } = await supabaseAdmin
            .from("products")
            .select("id, title, price_zar, is_published, is_free")
            .eq("id", itemId)
            .maybeSingle();

          if (error || !product) {
            return Response.json({ error: "Product not found." }, { status: 404 });
          }
          if (!product.is_published) {
            return Response.json({ error: "Product is not available." }, { status: 403 });
          }
          if (product.is_free) {
            return Response.json({ error: "This product is free — no payment needed." }, { status: 400 });
          }

          amountCents = Math.round((product as { price_zar: number }).price_zar * 100);
          label = (product as { title: string }).title;
          metadata = { ...metadata, productId: (product as { id: string }).id };

          // Pre-create purchase record (pending) so webhook can find it
          if (email) {
            await supabaseAdmin.from("purchases").insert({
              product_id: (product as { id: string }).id,
              email,
              amount_zar: (product as { price_zar: number }).price_zar,
              status: "pending",
            });
          }
        } else if (type === "membership") {
          const { data: plan, error } = await supabaseAdmin
            .from("membership_plans")
            .select("id, name, price_monthly, is_active")
            .eq("id", itemId)
            .maybeSingle();

          if (error || !plan) {
            return Response.json({ error: "Plan not found." }, { status: 404 });
          }
          if (!(plan as { is_active: boolean }).is_active) {
            return Response.json({ error: "Plan is not available." }, { status: 403 });
          }

          const billing = str(body.billing, 20) as "monthly" | "annual";
          const price = billing === "annual"
            ? (plan as { price_monthly: number }).price_monthly * 10  // 2 months free on annual
            : (plan as { price_monthly: number }).price_monthly;

          amountCents = Math.round(price * 100);
          label = `SKC Digital — ${(plan as { name: string }).name} (${billing === "annual" ? "Annual" : "1st month"})`;
          metadata = { ...metadata, planId: (plan as { id: string }).id, billing };
        } else {
          return Response.json({ error: "Invalid type." }, { status: 400 });
        }

        // Build line items for Yoco checkout display
        const requestBody = {
          amount: amountCents,
          currency: "ZAR",
          successUrl: `${SITE_URL}/checkout/success`,
          cancelUrl: `${SITE_URL}/${type === "product" ? "products" : "memberships"}`,
          failureUrl: `${SITE_URL}/checkout/failed`,
          clientReferenceId: email || undefined,
          metadata,
          lineItems: [
            {
              displayName: label,
              quantity: 1,
              pricingDetails: { price: amountCents },
            },
          ],
        };

        const headers: Record<string, string> = {
          Authorization: `Bearer ${YOCO_SECRET_KEY}`,
          "Content-Type": "application/json",
        };
        if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

        const res = await fetch(`${YOCO_API}/checkouts`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });

        const data = await res.json() as {
          id?: string;
          redirectUrl?: string;
          errorCode?: string;
          message?: string;
        };

        if (!res.ok) {
          console.error("[yoco/checkout] error:", data);
          return Response.json(
            { error: data.message ?? "Payment gateway error." },
            { status: res.status }
          );
        }

        return Response.json({ checkoutId: data.id, redirectUrl: data.redirectUrl });
      },
    },
  },
});
