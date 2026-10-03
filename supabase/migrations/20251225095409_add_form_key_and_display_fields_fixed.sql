/*
  # Add Form Key and Display Fields to Form Configurations

  1. Changes
    - Add `form_key` column for routing to specific form pages
    - Add `form_name_english` column for English form names
    - Add `form_name_dhivehi` column for Dhivehi form names
    - Add `is_active` column to control form visibility
    - Populate existing forms with correct values
  
  2. Purpose
    - Enable proper form routing and display in category views
    - Support bilingual form names
    - Allow forms to be activated/deactivated
*/

-- Add new columns without constraints first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'form_key'
  ) THEN
    ALTER TABLE form_configurations 
    ADD COLUMN form_key text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'form_name_english'
  ) THEN
    ALTER TABLE form_configurations 
    ADD COLUMN form_name_english text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'form_name_dhivehi'
  ) THEN
    ALTER TABLE form_configurations 
    ADD COLUMN form_name_dhivehi text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE form_configurations 
    ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Update existing forms with correct values
UPDATE form_configurations 
SET 
  form_key = 'stationery',
  form_name_english = 'Stationery Voucher Request Form',
  form_name_dhivehi = 'ސްޓޭޝަނަރީ ވައުޗަރ އެދޭ ފޯމް',
  is_active = true
WHERE form_type = 'stationery';

UPDATE form_configurations 
SET 
  form_key = 'office-items',
  form_name_english = 'Office Items Request Form',
  form_name_dhivehi = 'އޮފީސް ތަކެތި އެދޭ ފޯމް',
  is_active = true
WHERE form_type = 'office-items';

UPDATE form_configurations 
SET 
  form_key = 'volunteer',
  form_name_english = 'Volunteer Service Request Form',
  form_name_dhivehi = 'ޚިދުމަތަށް އެދޭ ފޯމް',
  is_active = true
WHERE form_type = 'volunteer';

-- Add constraints after data is populated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'form_configurations_form_key_key'
  ) THEN
    ALTER TABLE form_configurations 
    ADD CONSTRAINT form_configurations_form_key_key UNIQUE (form_key);
  END IF;
END $$;

-- Make columns NOT NULL after data is populated
ALTER TABLE form_configurations 
ALTER COLUMN form_key SET NOT NULL,
ALTER COLUMN form_name_english SET NOT NULL,
ALTER COLUMN form_name_dhivehi SET NOT NULL,
ALTER COLUMN is_active SET NOT NULL;