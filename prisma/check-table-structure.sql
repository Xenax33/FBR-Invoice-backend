-- Check the actual structure of invoice_items table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoice_items' 
ORDER BY ordinal_position;
