/*
  # Add Category Field to Form Configurations

  1. Changes
    - Add `category` column to `form_configurations` table with two options: 'student' or 'staff_others'
    - Default value is 'staff_others' for backward compatibility
    - Update existing forms to be categorized as 'staff_others'
  
  2. Purpose
    - Enable form categorization into Student and Staff and Others groups
    - Allow better organization and filtering of forms by target audience
*/

-- Add category column to form_configurations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'category'
  ) THEN
    ALTER TABLE form_configurations 
    ADD COLUMN category text NOT NULL DEFAULT 'staff_others' 
    CHECK (category IN ('student', 'staff_others'));
  END IF;
END $$;

-- Update existing forms to be categorized as staff_others
UPDATE form_configurations 
SET category = 'staff_others' 
WHERE category IS NULL OR category = 'staff_others';