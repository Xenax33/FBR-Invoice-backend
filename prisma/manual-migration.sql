-- Step 1: Get the first admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the first admin user
    SELECT id INTO admin_user_id FROM users WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1;
    
    -- If no admin user exists, get the first user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM users ORDER BY created_at LIMIT 1;
    END IF;
    
    -- Step 2: Backup existing hs_codes to a temp table
    CREATE TEMP TABLE hs_codes_backup AS SELECT * FROM hs_codes;
    
    -- Step 3: Delete all existing hs_codes (they will be recreated)
    DELETE FROM hs_codes;
    
    -- Step 4: Add the user_id column
    ALTER TABLE hs_codes ADD COLUMN user_id UUID NOT NULL;
    
    -- Step 5: Add foreign key constraint
    ALTER TABLE hs_codes ADD CONSTRAINT hs_codes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    
    -- Step 6: Drop old unique constraint
    ALTER TABLE hs_codes DROP CONSTRAINT IF EXISTS hs_codes_hs_code_key;
    
    -- Step 7: Add new unique constraint
    ALTER TABLE hs_codes ADD CONSTRAINT hs_codes_user_id_hs_code_key 
        UNIQUE (user_id, hs_code);
    
    -- Step 8: Restore the backed up hs_codes, assigning them to the admin user
    INSERT INTO hs_codes (id, user_id, hs_code, description, created_at, updated_at)
    SELECT id, admin_user_id, hs_code, description, created_at, updated_at
    FROM hs_codes_backup;
    
    RAISE NOTICE 'Migration completed successfully. Existing HS codes assigned to user: %', admin_user_id;
END $$;
