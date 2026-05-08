import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/check-role")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ isAdmin: false });
        }

        const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
        if (!userId) return Response.json({ isAdmin: false });

        const { data } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        return Response.json({ isAdmin: !!data });
      },
    },
  },
});
