import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid body." }, { status: 400 });
        }

        const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
        if (!userId) {
          return Response.json({ error: "userId required." }, { status: 400 });
        }

        // Check how many admins exist (bypasses RLS via service role)
        const { count } = await supabaseAdmin
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        if ((count ?? 0) > 0) {
          return Response.json({ promoted: false, reason: "admins_exist" });
        }

        // No admins yet — promote this user
        const { error } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ promoted: true });
      },
    },
  },
});
