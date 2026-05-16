import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Stripe sends webhook events as JSON (unsigned in test mode, signed in prod).
// We verify the signature when STRIPE_WEBHOOK_SECRET is set.

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
        const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

        if (!STRIPE_SECRET_KEY) {
          return Response.json({ error: "Stripe not configured." }, { status: 500 });
        }

        const rawBody = await request.text();
        let event: StripeEvent;

        if (STRIPE_WEBHOOK_SECRET) {
          const signature = request.headers.get("stripe-signature");
          if (!signature) {
            return Response.json({ error: "Missing stripe-signature header." }, { status: 400 });
          }
          const valid = await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
          if (!valid) {
            return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
          }
        }

        try {
          event = JSON.parse(rawBody) as StripeEvent;
        } catch {
          return Response.json({ error: "Invalid JSON." }, { status: 400 });
        }

        try {
          await handleEvent(event);
        } catch (err) {
          console.error("[stripe/webhook] handler error:", err);
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

async function handleEvent(event: StripeEvent) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as StripeCheckoutSession);
      break;

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChange(event.data.object as StripeSubscription);
      break;

    default:
      break;
  }
}

async function handleCheckoutCompleted(session: StripeCheckoutSession) {
  if (session.mode === "payment") {
    // Mark purchase as completed
    await supabaseAdmin
      .from("purchases")
      .update({
        status: "completed",
        stripe_payment_intent: session.payment_intent ?? null,
        download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("stripe_session_id", session.id);
  }

  if (session.mode === "subscription" && session.subscription) {
    // Fetch full subscription to get period dates
    const sub = await fetchStripeSubscription(
      session.subscription,
      process.env.STRIPE_SECRET_KEY!
    );
    if (!sub) return;

    const planId = await planIdFromPriceId(sub.items.data[0]?.price?.id ?? "");
    if (!planId) return;

    // Look up the Supabase user by email so we can link the membership
    const customerEmail = session.customer_email;
    let userId: string | null = null;
    if (customerEmail) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const match = users?.users?.find(
        (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );
      userId = match?.id ?? null;
    }

    const billingInterval =
      sub.items.data[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly";

    // If subscription record already exists (e.g. retry), update it; otherwise insert
    const { data: existing } = await supabaseAdmin
      .from("user_memberships")
      .select("id")
      .eq("stripe_subscription_id", session.subscription)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("user_memberships")
        .update({
          plan_id: planId,
          status: "active",
          billing_interval: billingInterval,
          stripe_customer_id: session.customer ?? null,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq("id", (existing as { id: string }).id);
    } else if (userId) {
      await supabaseAdmin.from("user_memberships").insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        billing_interval: billingInterval,
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }
  }
}

async function handleSubscriptionChange(sub: StripeSubscription) {
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "past_due",
    trialing: "trialing",
    paused: "paused",
  };

  await supabaseAdmin
    .from("user_memberships")
    .update({
      status: statusMap[sub.status] ?? sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", sub.id);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function planIdFromPriceId(priceId: string): Promise<string | null> {
  if (!priceId) return null;
  const { data } = await supabaseAdmin
    .from("membership_plans")
    .select("id")
    .or(`stripe_price_monthly.eq.${priceId},stripe_price_annual.eq.${priceId}`)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function fetchStripeSubscription(
  subscriptionId: string,
  secretKey: string
): Promise<StripeSubscription | null> {
  const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<StripeSubscription>;
}

// Stripe webhook signature verification (HMAC-SHA256 via Web Crypto)
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.split("=") as [string, string])
    );
    const timestamp = parts["t"];
    const sig = parts["v1"];
    if (!timestamp || !sig) return false;

    const signedPayload = `${timestamp}.${payload}`;
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
      new TextEncoder().encode(signedPayload)
    );
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expected === sig;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stripe type stubs (only the fields we use)
// ---------------------------------------------------------------------------

type StripeEvent = {
  type: string;
  data: { object: unknown };
};

type StripeCheckoutSession = {
  id: string;
  mode: "payment" | "subscription";
  customer?: string | null;
  customer_email?: string | null;
  subscription?: string | null;
  payment_intent?: string | null;
};

type StripeSubscription = {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        recurring?: { interval: string } | null;
      };
    }>;
  };
};
