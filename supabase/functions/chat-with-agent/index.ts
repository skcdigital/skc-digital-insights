// supabase/functions/chat-with-agent/index.ts
//
// Securely proxies chat requests from the SKC Digital website to the
// Azure AI Foundry agent. The Azure API key NEVER leaves this function.
//
// Deploy with:  supabase functions deploy chat-with-agent --no-verify-jwt
// Set secrets: supabase secrets set AZURE_API_KEY=xxx AZURE_ENDPOINT=xxx

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// ─────────────────────────────────────────────────────────────────
// CORS — allow your website to call this function
// ─────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://skcdigital.co.za",
  "https://www.skcdigital.co.za",
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

// ─────────────────────────────────────────────────────────────────
// Simple in-memory rate limiter (resets when function cold-starts)
// Limits each IP to 30 messages per hour
// ─────────────────────────────────────────────────────────────────
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 30;
const HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + HOUR_MS });
    return { allowed: true, remaining: MAX_PER_HOUR - 1 };
  }

  if (entry.count >= MAX_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_PER_HOUR - entry.count };
}

// ─────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────
serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many messages. Please try again later or contact us on WhatsApp.",
      }),
      {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request
    const body = await req.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    // Validate
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Limit conversation length (cost protection)
    if (messages.length > 30) {
      return new Response(
        JSON.stringify({
          error: "Conversation too long. Please refresh to start a new chat.",
        }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: "Invalid message format" }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Message too long (max 2000 characters)" }),
          {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Get secrets
    const AZURE_API_KEY = Deno.env.get("AZURE_API_KEY");
    const AZURE_ENDPOINT = Deno.env.get("AZURE_ENDPOINT");

    if (!AZURE_API_KEY || !AZURE_ENDPOINT) {
      console.error("Missing Azure environment variables");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        {
          status: 503,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    // Build the request payload for Azure Foundry agent
    // Foundry agents use the OpenAI-compatible Responses API
    const payload = {
      input: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: false,
    };

    // Call Azure Foundry
    const azureResponse = await fetch(AZURE_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": AZURE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("Azure error:", azureResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Sorry, I'm having trouble connecting right now. Please try again or message us on WhatsApp.",
        }),
        {
          status: 502,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    const data = await azureResponse.json();

    // Extract assistant reply from Foundry response
    // Foundry responses follow OpenAI Responses API format
    let assistantMessage = "";

    if (data.output && Array.isArray(data.output)) {
      // Standard Responses API format
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const part of item.content) {
            if (part.type === "output_text" && part.text) {
              assistantMessage += part.text;
            }
          }
        }
      }
    } else if (data.choices?.[0]?.message?.content) {
      // Fallback for chat completions format
      assistantMessage = data.choices[0].message.content;
    } else if (typeof data.output_text === "string") {
      // Simple shape
      assistantMessage = data.output_text;
    }

    if (!assistantMessage) {
      console.error("No message in response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({
          error: "Sorry, I couldn't generate a response. Please try rephrasing or message us on WhatsApp.",
        }),
        {
          status: 502,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        remaining: remaining,
      }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({
        error: "Something went wrong. Please try again or contact us on WhatsApp.",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }
});
