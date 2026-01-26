-- Insert BOTH lost invoices that were successfully posted to FBR

DO $$
DECLARE
  v_invoice_id1 UUID;
  v_invoice_id2 UUID;
  v_error_message TEXT;
BEGIN
  -- ============= FIRST INVOICE =============
  -- Invoice Number: 3520223926179DIABBBOM380503
  -- Date: 2026-01-27 01:40:12
  
  -- Check if first invoice already exists
  SELECT id INTO v_invoice_id1 FROM invoices WHERE fbr_invoice_number = '3520223926179DIABBBOM380503';
  
  IF v_invoice_id1 IS NULL THEN
    RAISE NOTICE 'Inserting first invoice...';
    
    INSERT INTO invoices (
      id, user_id, buyer_id, scenario_id, invoice_type, invoice_date,
      invoice_ref_no, fbr_invoice_number, fbr_response, is_test_environment,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      '0b4c0575-ad97-4ac3-bb39-af7d2c66959c',
      '80d0b517-befe-4af1-8daa-f0431554dbec',
      NULL,
      'Sale Invoice',
      '2026-01-09',
      'INV-2026-01-09-0001',
      '3520223926179DIABBBOM380503',
      '{"invoiceNumber": "3520223926179DIABBBOM380503", "dated": "2026-01-27 01:40:12", "validationResponse": {"statusCode": "00", "status": "Valid", "error": "", "invoiceStatuses": [{"itemSNo": "1", "statusCode": "00", "status": "Valid", "invoiceNo": "3520223926179DIABBBOM380503-1", "errorCode": "", "error": ""}]}}'::jsonb,
      false,
      NOW(),
      NOW()
    ) RETURNING id INTO v_invoice_id1;
    
    -- Insert first invoice item
    INSERT INTO invoice_items (
      id, invoice_id, hs_code_id, product_description, rate, unit_of_measurement,
      quantity, total_values, value_sales_excluding_st, fixed_notified_value_or_retail_price,
      sales_tax_applicable, sales_tax_withheld_at_source, extra_tax, further_tax,
      sro_schedule_no, fed_payable, discount, sale_type, sro_item_serial_no,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_invoice_id1,
      'edd7e7f6-a4fd-4e19-b42a-ea5f68486264',
      'KHAKI',
      '18%',
      'KG',
      7.32,
      10448.90,
      8855.00,
      115.00,
      1593.90,
      0.00,
      '0',
      0.00,
      '',
      0.00,
      0.00,
      'Goods at standard rate (default)',
      '',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'First invoice inserted with ID: %', v_invoice_id1;
  ELSE
    RAISE NOTICE 'First invoice already exists with ID: %', v_invoice_id1;
  END IF;

  -- ============= SECOND INVOICE =============
  -- Invoice Number: 3520223926179DIABBCQI649893
  -- Date: 2026-01-27 02:42:08
  
  -- Check if second invoice already exists
  SELECT id INTO v_invoice_id2 FROM invoices WHERE fbr_invoice_number = '3520223926179DIABBCQI649893';
  
  IF v_invoice_id2 IS NULL THEN
    RAISE NOTICE 'Inserting second invoice...';
    
    INSERT INTO invoices (
      id, user_id, buyer_id, scenario_id, invoice_type, invoice_date,
      invoice_ref_no, fbr_invoice_number, fbr_response, is_test_environment,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      '0b4c0575-ad97-4ac3-bb39-af7d2c66959c',
      '80d0b517-befe-4af1-8daa-f0431554dbec',
      NULL,
      'Sale Invoice',
      '2026-01-09',
      'INV-2026-01-09-0002',
      '3520223926179DIABBCQI649893',
      '{"invoiceNumber": "3520223926179DIABBCQI649893", "dated": "2026-01-27 02:42:08", "validationResponse": {"statusCode": "00", "status": "Valid", "error": "", "invoiceStatuses": [{"itemSNo": "1", "statusCode": "00", "status": "Valid", "invoiceNo": "3520223926179DIABBCQI649893-1", "errorCode": "", "error": ""}]}}'::jsonb,
      false,
      NOW(),
      NOW()
    ) RETURNING id INTO v_invoice_id2;
    
    -- Insert second invoice item
    INSERT INTO invoice_items (
      id, invoice_id, hs_code_id, product_description, rate, unit_of_measurement,
      quantity, total_values, value_sales_excluding_st, fixed_notified_value_or_retail_price,
      sales_tax_applicable, sales_tax_withheld_at_source, extra_tax, further_tax,
      sro_schedule_no, fed_payable, discount, sale_type, sro_item_serial_no,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_invoice_id2,
      'edd7e7f6-a4fd-4e19-b42a-ea5f68486264',
      'KHAKI # 50',
      '18%',
      'KG',
      6.65,
      8673.00,
      7350.00,
      105.00,
      1323.00,
      0.00,
      '0',
      0.00,
      '',
      0.00,
      0.00,
      'Goods at standard rate (default)',
      '',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Second invoice inserted with ID: %', v_invoice_id2;
  ELSE
    RAISE NOTICE 'Second invoice already exists with ID: %', v_invoice_id2;
  END IF;
  
  RAISE NOTICE '✅ All lost invoices processed successfully!';
  
EXCEPTION
  WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE EXCEPTION 'Error occurred: %', v_error_message;
END $$;
