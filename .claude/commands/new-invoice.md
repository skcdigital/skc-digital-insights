Create a new invoice for a client and insert it into the SKC Digital Supabase database.

## Steps

1. Ask me for the following details (one message, all at once):
   - **Client name** (required)
   - **Client email** (optional but recommended)
   - **Client phone** (optional)
   - **Client address** (optional)
   - **Line items** — for each item: description, quantity, unit price (in Rands)
   - **Notes** (optional)
   - **Due date** (optional — default to 7 days from today)
   - **Banking details** (optional — if not provided, use: "FNB · SKC Digital · Acc: [your account number] · Branch: 250655")

2. Calculate:
   - Subtotal = sum of all line totals
   - Total = subtotal
   - Amount paid = 0 (default)

3. Use the Supabase MCP tool (`mcp__claude_ai_Supabase__execute_sql`) to:
   a. Get the next invoice number:
      ```sql
      UPDATE doc_counters SET last_val = last_val + 1 WHERE doc_type = 'invoice' RETURNING last_val;
      ```
      Format as `SKC-INV-XXXX` (zero-pad to 4 digits).

   b. Insert the invoice:
      ```sql
      INSERT INTO invoices (number, status, issue_date, due_date, client_name, client_email, client_phone, client_address, notes, banking_details, subtotal, total, amount_paid)
      VALUES (...)
      RETURNING id;
      ```

   c. Insert each line item:
      ```sql
      INSERT INTO invoice_items (invoice_id, position, description, quantity, unit_price, line_total)
      VALUES (...);
      ```

4. After inserting, tell me:
   - The invoice number (e.g. SKC-INV-0012)
   - The total amount
   - "Go to https://skcdigital.co.za/admin/invoices to download the PDF and email it to the client."
   - "The PDF will include a PayFast payment link: https://skcdigital.co.za/pay/invoice/SKC-INV-XXXX"

## Notes
- `doc_counters` table has a row with `doc_type = 'invoice'`.
- No VAT unless explicitly asked.
- If the user says "quote" instead, suggest `/new-quote`.
