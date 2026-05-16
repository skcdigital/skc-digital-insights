import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// PayFast ITN (Instant Transaction Notification) handler.
// PayFast POSTs to this URL after every payment attempt.

const PF_VALID_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

export const Route = createFileRoute("/api/payfast/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID ?? "";
        const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? "";
        const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === "true";
        const SITE_URL = process.env.SITE_URL ?? "https://www.skcdigital.co.za";

        const rawBody = await request.text();
        const params = new URLSearchParams(rawBody);
        const data = Object.fromEntries(params.entries());

        // Step 1: Verify signature
        const receivedSig = data["signature"] ?? "";
        const fieldsWithoutSig = Object.fromEntries(
          Object.entries(data).filter(([k]) => k !== "signature")
        );
        const expectedSig = generateSignature(fieldsWithoutSig, PAYFAST_PASSPHRASE);
        if (receivedSig !== expectedSig) {
          console.error("[payfast/notify] Signature mismatch");
          return new Response("Invalid signature", { status: 400 });
        }

        // Step 2: Verify merchant ID matches
        if (data["merchant_id"] !== PAYFAST_MERCHANT_ID) {
          console.error("[payfast/notify] Merchant ID mismatch");
          return new Response("Merchant mismatch", { status: 400 });
        }

        // Step 3: Validate ITN with PayFast servers (recommended)
        const pfHost = PAYFAST_SANDBOX ? "sandbox.payfast.co.za" : "www.payfast.co.za";
        if (!PF_VALID_HOSTS.includes(pfHost)) {
          return new Response("Invalid host", { status: 400 });
        }

        try {
          const validateRes = await fetch(`https://${pfHost}/eng/query/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: rawBody,
          });
          const validateText = await validateRes.text();
          if (!validateText.includes("VALID")) {
            console.error("[payfast/notify] PayFast validation failed:", validateText);
            return new Response("ITN validation failed", { status: 400 });
          }
        } catch (err) {
          console.error("[payfast/notify] Could not validate with PayFast:", err);
          // Don't reject — PayFast docs say to process if validation server unreachable
        }

        // Step 4: Handle based on payment_status
        const status = data["payment_status"];
        const mPaymentId = data["m_payment_id"] ?? "";
        const amountGross = parseFloat(data["amount_gross"] ?? "0");

        if (status === "COMPLETE") {
          await handleComplete(mPaymentId, amountGross, data);
        } else if (status === "FAILED" || status === "CANCELLED") {
          await handleFailed(mPaymentId);
        }

        // PayFast expects a 200 OK with empty body
        return new Response("", { status: 200 });
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleComplete(
  mPaymentId: string,
  amountGross: number,
  data: Record<string, string>
) {
  if (mPaymentId.startsWith("prod-")) {
    // Extract purchase ID from m_payment_id (format: prod-<purchase-uuid>)
    const purchaseId = mPaymentId.replace("prod-", "");
    await supabaseAdmin
      .from("purchases")
      .update({
        status: "completed",
        stripe_payment_intent: data["pf_payment_id"] ?? null,
        download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", purchaseId);
  }

  if (mPaymentId.startsWith("mem-")) {
    // Format: mem-<plan-id>-<billing>-<timestamp>
    const parts = mPaymentId.split("-");
    // UUID is parts[1]-[2]-[3]-[4]-[5], billing is parts[6]
    const planId = parts.slice(1, 6).join("-");
    const billing = parts[6] as "monthly" | "annual";
    const email = data["email_address"] ?? "";

    if (!planId || !email) return;

    // Find user by email
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const match = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!match) return;

    const userId = match.id;
    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

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
          billing_interval: billing,
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

async function handleFailed(mPaymentId: string) {
  if (mPaymentId.startsWith("prod-")) {
    const purchaseId = mPaymentId.replace("prod-", "");
    await supabaseAdmin
      .from("purchases")
      .update({ status: "failed" })
      .eq("id", purchaseId);
  }
}

// ---------------------------------------------------------------------------
// Signature — same algorithm as checkout.ts but applied to ITN fields
// ---------------------------------------------------------------------------
function generateSignature(fields: Record<string, string>, passphrase: string): string {
  let payload = Object.entries(fields)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
    .join("&");

  if (passphrase) {
    payload += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return md5(payload);
}

function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  function safeAdd(x: number, y: number) { const l=(x&0xffff)+(y&0xffff); return((x>>16)+(y>>16)+(l>>16)<<16)|(l&0xffff); }
  function rol(n: number, c: number) { return (n<<c)|(n>>>(32-c)); }
  function cmn(q: number,a: number,b: number,x: number,s: number,t: number){return safeAdd(rol(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function ff(a: number,b: number,c: number,d: number,x: number,s: number,t: number){return cmn((b&c)|(~b&d),a,b,x,s,t);}
  function gg(a: number,b: number,c: number,d: number,x: number,s: number,t: number){return cmn((b&d)|(c&~d),a,b,x,s,t);}
  function hh(a: number,b: number,c: number,d: number,x: number,s: number,t: number){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a: number,b: number,c: number,d: number,x: number,s: number,t: number){return cmn(c^(b|~d),a,b,x,s,t);}
  const l8=bytes.length,l32=Math.ceil((l8+9)/64)*16,M=new Int32Array(l32);
  for(let i=0;i<l8;i++)M[i>>2]|=bytes[i]<<((i%4)*8);
  M[l8>>2]|=0x80<<((l8%4)*8);M[l32-2]=l8*8;
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<l32;i+=16){
    const[oA,oB,oC,oD]=[a,b,c,d];
    a=ff(a,b,c,d,M[i],7,-680876936);d=ff(d,a,b,c,M[i+1],12,-389564586);c=ff(c,d,a,b,M[i+2],17,606105819);b=ff(b,c,d,a,M[i+3],22,-1044525330);
    a=ff(a,b,c,d,M[i+4],7,-176418897);d=ff(d,a,b,c,M[i+5],12,1200080426);c=ff(c,d,a,b,M[i+6],17,-1473231341);b=ff(b,c,d,a,M[i+7],22,-45705983);
    a=ff(a,b,c,d,M[i+8],7,1770035416);d=ff(d,a,b,c,M[i+9],12,-1958414417);c=ff(c,d,a,b,M[i+10],17,-42063);b=ff(b,c,d,a,M[i+11],22,-1990404162);
    a=ff(a,b,c,d,M[i+12],7,1804603682);d=ff(d,a,b,c,M[i+13],12,-40341101);c=ff(c,d,a,b,M[i+14],17,-1502002290);b=ff(b,c,d,a,M[i+15],22,1236535329);
    a=gg(a,b,c,d,M[i+1],5,-165796510);d=gg(d,a,b,c,M[i+6],9,-1069501632);c=gg(c,d,a,b,M[i+11],14,643717713);b=gg(b,c,d,a,M[i],20,-373897302);
    a=gg(a,b,c,d,M[i+5],5,-701558691);d=gg(d,a,b,c,M[i+10],9,38016083);c=gg(c,d,a,b,M[i+15],14,-660478335);b=gg(b,c,d,a,M[i+4],20,-405537848);
    a=gg(a,b,c,d,M[i+9],5,568446438);d=gg(d,a,b,c,M[i+14],9,-1019803690);c=gg(c,d,a,b,M[i+3],14,-187363961);b=gg(b,c,d,a,M[i+8],20,1163531501);
    a=gg(a,b,c,d,M[i+13],5,-1444681467);d=gg(d,a,b,c,M[i+2],9,-51403784);c=gg(c,d,a,b,M[i+7],14,1735328473);b=gg(b,c,d,a,M[i+12],20,-1926607734);
    a=hh(a,b,c,d,M[i+5],4,-378558);d=hh(d,a,b,c,M[i+8],11,-2022574463);c=hh(c,d,a,b,M[i+11],16,1839030562);b=hh(b,c,d,a,M[i+14],23,-35309556);
    a=hh(a,b,c,d,M[i+1],4,-1530992060);d=hh(d,a,b,c,M[i+4],11,1272893353);c=hh(c,d,a,b,M[i+7],16,-155497632);b=hh(b,c,d,a,M[i+10],23,-1094730640);
    a=hh(a,b,c,d,M[i+13],4,681279174);d=hh(d,a,b,c,M[i],11,-358537222);c=hh(c,d,a,b,M[i+3],16,-722521979);b=hh(b,c,d,a,M[i+6],23,76029189);
    a=hh(a,b,c,d,M[i+9],4,-640364487);d=hh(d,a,b,c,M[i+12],11,-421815835);c=hh(c,d,a,b,M[i+15],16,530742520);b=hh(b,c,d,a,M[i+2],23,-995338651);
    a=ii(a,b,c,d,M[i],6,-198630844);d=ii(d,a,b,c,M[i+7],10,1126891415);c=ii(c,d,a,b,M[i+14],15,-1416354905);b=ii(b,c,d,a,M[i+5],21,-57434055);
    a=ii(a,b,c,d,M[i+12],6,1700485571);d=ii(d,a,b,c,M[i+3],10,-1894986606);c=ii(c,d,a,b,M[i+10],15,-1051523);b=ii(b,c,d,a,M[i+1],21,-2054922799);
    a=ii(a,b,c,d,M[i+8],6,1873313359);d=ii(d,a,b,c,M[i+15],10,-30611744);c=ii(c,d,a,b,M[i+6],15,-1560198380);b=ii(b,c,d,a,M[i+13],21,1309151649);
    a=ii(a,b,c,d,M[i+4],6,-145523070);d=ii(d,a,b,c,M[i+11],10,-1120210379);c=ii(c,d,a,b,M[i+2],15,718787259);b=ii(b,c,d,a,M[i+9],21,-343485551);
    a=safeAdd(a,oA);b=safeAdd(b,oB);c=safeAdd(c,oC);d=safeAdd(d,oD);
  }
  return[a,b,c,d].map(n=>{let s="";for(let i=0;i<4;i++)s+=hex((n>>(i*8))&0xff);return s;}).join("");
}
