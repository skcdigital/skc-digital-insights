Create a new quote for a client and insert it into the SKC Digital Supabase database.

## Steps

1. Ask me for the following details (one message, all at once):
   - **Client name** (required)
   - **Client email** (optional but recommended for emailing the PDF)
   - **Client phone** (optional)
   - **Client address** (optional)
   - **Line items** — for each item: description, quantity, unit price (in Rands)
   - **Notes** (optional — e.g. "Quote valid 14 days. 50% deposit required to start.")
   - **Valid until date** (optional — default to 14 days from today: $CURRENT_DATE + 14 days)

2. Calculate:
   - Subtotal = sum of all line totals
   - Total = subtotal (we don't add VAT unless client asks)

3. Use the Supabase MCP tool (`mcp__claude_ai_Supabase__execute_sql`) to:
   a. Get the next quote number by running:
      ```sql
      UPDATE doc_counters SET last_val = last_val + 1 WHERE doc_type = 'quote' RETURNING last_val;
      ```
      Format as `SKC-QT-XXXX` (zero-pad to 4 digits).

   b. Insert the quote:
      ```sql
      INSERT INTO quotes (number, status, issue_date, valid_until, client_name, client_email, client_phone, client_address, notes, subtotal, total)
      VALUES (...)
      RETURNING id;
      ```

   c. Insert each line item:
      ```sql
      INSERT INTO quote_items (quote_id, position, description, quantity, unit_price, line_total)
      VALUES (...);
      ```

4. After inserting, tell me:
   - The quote number (e.g. SKC-QT-0007)
   - The total amount
   - "Go to https://skcdigital.co.za/admin/quotes to download the PDF and email it to the client."
   - "The PDF will include a PayFast payment link: https://skcdigital.co.za/pay/quote/SKC-QT-XXXX"

## Notes
- The Supabase project for this app is the one configured in the MCP connection.
- `doc_counters` table has a row with `doc_type = 'quote'` — always use that to get the next sequential number.
- Keep it simple — no VAT calculation unless the user specifically asks for it.
- If the user says "invoice" instead of "quote", run `/new-invoice` instead (same flow but use `invoices` and `invoice_items` tables, and `doc_type = 'invoice'`).
