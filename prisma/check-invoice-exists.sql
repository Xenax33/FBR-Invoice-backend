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
WHERE fbr_invoice_number = '3520223926179DIABBBOM380503';
