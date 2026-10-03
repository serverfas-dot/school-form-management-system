/*
  # Add Form Access Control
  
  ## Overview
  Adds the ability for super admin to control whether forms are open for public access.
  When a form is closed, public users will see a locked state instead of the form.
  
  ## Changes
  - Add `is_open` boolean column to form_configurations table
  - Default all forms to closed (false) for security
  - Add `open_date` and `close_date` columns for tracking when forms are opened/closed
  
  ## Security
  - Only super admin can modify the is_open status (existing RLS policies)
  - Public users can read the is_open status to determine if they can access the form
*/

-- Add is_open column to control form access
ALTER TABLE form_configurations
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT false;

-- Add timestamp columns for tracking
ALTER TABLE form_configurations
ADD COLUMN IF NOT EXISTS open_date TIMESTAMPTZ;

ALTER TABLE form_configurations
ADD COLUMN IF NOT EXISTS close_date TIMESTAMPTZ;

-- Update existing position application form to be closed by default
UPDATE form_configurations
SET is_open = false
WHERE form_key = 'position-application';
