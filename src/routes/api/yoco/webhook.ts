import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/yoco/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET;

        const rawBody = await request.text();

        // Verify signature if secret is configured
        if (YOCO_WEBHOOK_SECRET) {
          const sig = request.headers.get("webhook-signature");
          if (!sig) {
            return Response.json({ error: "Missing webhook-signature." }, { status: 400 });
          }
          const valid = await verifyYocoSignature(rawBody, sig, YOCO_WEBHOOK_SECRET);
          if (!valid) {
            return Response.json({ error: "Invalid signature." }, { status: 401 });
          }
        }

        let event: YocoWebhookEvent;
        try {
          event = JSON.parse(rawBody) as YocoWebhookEvent;
        } catch {
          return Response.json({ error: "Invalid JSON." }, { status: 400 });
        }

        try {
          await handleEvent(event);
        } catch (err) {
          console.error("[yoco/webhook] handler error:", err);
          return Response.json({ error: "Handler failed." }, { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleEvent(event: YocoWebhookEvent) {
  switch (event.type) {
    case "payment.succeeded":
      await handlePaymentSucceeded(event);
      break;
    case "payment.failed":
      await handlePaymentFailed(event);
      break;
    default:
      break;
  }
}

async function handlePaymentSucceeded(event: YocoWebhookEvent) {
  const payload = event.payload;
  const metadata = payload.metadata ?? {};
  const type = metadata.type as "product" | "membership" | undefined;

  if (type === "product") {
    const productId = metadata.productId;
    if (!productId) return;

    // Find the pending purchase and mark it complete
    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("product_id", productId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (purchase) {
      await supabaseAdmin
        .from("purchases")
        .update({
          status: "completed",
          stripe_payment_intent: payload.id, // reusing field for Yoco payment ID
          download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", (purchase as { id: string }).id);
    }
  }

  if (type === "membership") {
    const planId = metadata.planId;
    const billing = (metadata.billing as "monthly" | "annual") ?? "monthly";
    if (!planId) return;

    // Look up user by clientReferenceId (email) if we have it
    let userId: string | null = null;
    if (payload.clientReferenceId) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const match = users?.users?.find(
        (u) => u.email?.toLowerCase() === payload.clientReferenceId?.toLowerCase()
      );
      userId = match?.id ?? null;
    }

    if (!userId) return;

    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Check if membership already exists for this user + plan
    const { data: existing } = await supabaseAdmin
      .from("user_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("user_memberships")
        .update({
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", (existing as { id: string }).id);
    } else {
      await supabaseAdmin.from("user_memberships").insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        billing_interval: billing,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }
  }
}

async function handlePaymentFailed(event: YocoWebhookEvent) {
  const metadata = event.payload.metadata ?? {};
  const type = metadata.type as "product" | undefined;

  if (type === "product" && metadata.productId) {
    await supabaseAdmin
      .from("purchases")
      .update({ status: "failed" })
      .eq("product_id", metadata.productId)
      .eq("status", "pending");
  }
}

// ---------------------------------------------------------------------------
// Signature verification (HMAC-SHA256 of raw body)
// ---------------------------------------------------------------------------

async function verifyYocoSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return expected === signature;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Yoco webhook type stubs
// ---------------------------------------------------------------------------

type YocoWebhookEvent = {
  id: string;
  type: "payment.succeeded" | "payment.failed" | string;
  createdDate: string;
  payload: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    mode: "live" | "test";
    clientReferenceId?: string;
    metadata?: Record<string, string>;
  };
};
