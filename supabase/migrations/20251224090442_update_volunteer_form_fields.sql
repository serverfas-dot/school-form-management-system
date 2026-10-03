/*
  # Update Volunteer Form Fields

  1. Changes
    - Drop old columns that are no longer needed
    - Add new columns matching the requested structure:
      - name (already exists)
      - designation (new)
      - address (new)
      - id_number (new)
      - email (new)
      - phone_number (new)
    - Keep volunteer_activities column for backward compatibility
    
  2. Notes
    - Old columns (child_student, blood_group, mobile_number, additional_mobile, arrangement, office_number) are removed
    - All new columns are optional except name and phone_number
*/

-- Add new columns
ALTER TABLE volunteer_form_submissions
ADD COLUMN IF NOT EXISTS designation text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS id_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text;

-- Drop old columns that are no longer needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'child_student') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN child_student;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'blood_group') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN blood_group;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'mobile_number') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN mobile_number;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'additional_mobile') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN additional_mobile;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'arrangement') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN arrangement;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_form_submissions' AND column_name = 'office_number') THEN
    ALTER TABLE volunteer_form_submissions DROP COLUMN office_number;
  END IF;
END $$;