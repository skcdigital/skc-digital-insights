// Injects runtime env vars into the generated wrangler.json before deploy.
// Cloudflare Workers read these via process.env (shimmed by the adapter).
import { readFileSync, writeFileSync } from "fs";

const path = "dist/server/wrangler.json";
const config = JSON.parse(readFileSync(path, "utf8"));

config.vars = {
  ...(config.vars ?? {}),
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

writeFileSync(path, JSON.stringify(config, null, 2));
console.log("✓ Patched wrangler.json with env vars");
