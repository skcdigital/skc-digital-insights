import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Loader2 } from "lucide-react";

// PayFast hosted payment page
const PF_URL = "https://www.payfast.co.za/eng/process";
const PF_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";

export const Route = createFileRoute("/pay/$type/$number")({
  head: () => ({
    meta: [
      { title: "Pay securely — SKC Digital" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async ({ params }) => {
    const { type, number } = params;

    const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
    const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
    const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? "";
    const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === "true";
    const SITE_URL = process.env.SITE_URL ?? "https://www.skcdigital.co.za";

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      return { error: "Payment gateway not configured. Please contact us." };
    }

    let amountZar: number;
    let clientEmail: string | null;
    let itemName: string;

    if (type === "invoice") {
      const { data: inv } = await supabaseAdmin
        .from("invoices")
        .select("total, amount_paid, client_email, number")
        .eq("number", number)
        .maybeSingle();

      if (!inv) return { error: "Invoice not found." };
      const invoice = inv as { total: number; amount_paid: number; client_email: string | null; number: string };
      const outstanding = invoice.total - (invoice.amount_paid ?? 0);
      if (outstanding <= 0) return { error: "This invoice has already been paid in full." };

      amountZar = outstanding;
      clientEmail = invoice.client_email;
      itemName = `SKC Digital — Invoice ${invoice.number}`;
    } else if (type === "quote") {
      const { data: qt } = await supabaseAdmin
        .from("quotes")
        .select("total, client_email, number")
        .eq("number", number)
        .maybeSingle();

      if (!qt) return { error: "Quote not found." };
      const quote = qt as { total: number; client_email: string | null; number: string };

      amountZar = quote.total;
      clientEmail = quote.client_email;
      itemName = `SKC Digital — Quote ${quote.number}`;
    } else {
      return { error: "Invalid payment type." };
    }

    const fields: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${SITE_URL}/pay/success`,
      cancel_url: `${SITE_URL}/contact`,
      notify_url: `${SITE_URL}/api/payfast/notify`,
      ...(clientEmail ? { email_address: clientEmail } : {}),
      m_payment_id: `${type}-${number}-${Date.now()}`,
      amount: amountZar.toFixed(2),
      item_name: itemName.slice(0, 100),
    };

    const signature = generateSignature(fields, PAYFAST_PASSPHRASE);
    const paymentUrl = PAYFAST_SANDBOX ? PF_SANDBOX_URL : PF_URL;

    return { fields: { ...fields, signature }, paymentUrl, amountZar, itemName };
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

// MD5 signature — same pure-JS implementation as before
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
  function safeAdd(x: number, y: number) { const l=(x&0xffff)+(y&0xffff); return(((x>>16)+(y>>16)+(l>>16))<<16)|(l&0xffff); }
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
