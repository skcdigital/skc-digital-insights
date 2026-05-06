import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
        const password = typeof payload.password === "string" ? payload.password : "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "A valid email address is required." }, { status: 400 });
        }
        if (!password || password.length < 8) {
          return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json({ id: data.user.id });
      },
    },
  },
});
