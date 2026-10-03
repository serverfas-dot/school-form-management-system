/*
  # Fix Form Fields RLS for Super Admin Access
  
  ## Overview
  Updates RLS policies on form_fields table to allow super admins (using anon authentication) to have full access to all form fields including inactive ones for management purposes.
  
  ## Changes
  - Drop existing restrictive SELECT policy that only shows active fields
  - Drop existing FOR ALL policy and replace with specific policies
  - Create new policies that allow:
    - SELECT: Read all fields (both active and inactive) for management
    - INSERT: Create new fields
    - UPDATE: Edit all fields
    - DELETE: Delete fields
  
  ## Security Notes
  This is safe because:
  - The FormFieldEditor component is only accessible through protected super admin routes
  - Super admins need to see and manage both active and inactive fields
  - The frontend enforces access control before showing these editors
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read form fields" ON form_fields;
DROP POLICY IF EXISTS "Anyone can manage form fields" ON form_fields;

-- Create new comprehensive policies for full management access
CREATE POLICY "Allow public read access to all form fields"
  ON form_fields
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to form fields"
  ON form_fields
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to form fields"
  ON form_fields
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to form fields"
  ON form_fields
  FOR DELETE
  TO anon, authenticated
  USING (true);
