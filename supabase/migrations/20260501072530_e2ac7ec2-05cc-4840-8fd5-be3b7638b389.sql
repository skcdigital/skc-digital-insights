-- Lock down SECURITY DEFINER helpers from direct execution
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_document_number(TEXT, TEXT) FROM PUBLIC, anon;
-- next_document_number stays callable by authenticated (admins) — granted earlier.

-- Tighten INSERT policies on public-writable tables with payload limits.
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND (email IS NULL OR char_length(email) <= 320)
    AND (phone IS NULL OR char_length(phone) <= 50)
    AND (service IS NULL OR char_length(service) <= 200)
    AND (budget IS NULL OR char_length(budget) <= 100)
    AND (deadline IS NULL OR char_length(deadline) <= 100)
    AND (message IS NULL OR char_length(message) <= 5000)
  );

DROP POLICY IF EXISTS "Anyone can create conversation" ON public.chat_conversations;
CREATE POLICY "Anyone can create conversation"
  ON public.chat_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(visitor_id) BETWEEN 8 AND 64
    AND (visitor_name IS NULL OR char_length(visitor_name) <= 200)
    AND (visitor_email IS NULL OR char_length(visitor_email) <= 320)
  );

DROP POLICY IF EXISTS "Anyone can post messages" ON public.chat_messages;
CREATE POLICY "Anyone can post messages"
  ON public.chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    role IN ('user','assistant','system')
    AND char_length(content) BETWEEN 1 AND 4000
  );