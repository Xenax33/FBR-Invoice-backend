-- Check if invoice already exists
SELECT 
  id,
  user_id,
  buyer_id,
  fbr_invoice_number,
  invoice_ref_no,
  invoice_date,
  created_at
FROM invoices 
WHERE fbr_invoice_number = '3520223926179DIABBBOM380503' 
   OR invoice_ref_no = 'INV-2026-01-09-0001';

-- Check invoice items for this FBR number
SELECT 
  ii.*
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
WHERE i.fbr_invoice_number = '3520223926179DIABBBOM380503';

-- Check constraints on invoices table
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE
        WHEN con.contype = 'u' THEN 'UNIQUE'
        WHEN con.contype = 'p' THEN 'PRIMARY KEY'
        WHEN con.contype = 'f' THEN 'FOREIGN KEY'
        WHEN con.contype = 'c' THEN 'CHECK'
    END AS constraint_description,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'invoices';
