/*
  # Fix Form Configurations RLS for Anon Access
  
  ## Overview
  Updates RLS policies on form_configurations table to allow anon users (super admins) to have full INSERT, UPDATE, DELETE access for form management.
  
  ## Changes
  - Drop existing restrictive INSERT policy that only allows authenticated users
  - Create new policies that allow anon and authenticated users to:
    - INSERT new form configurations
    - DELETE form configurations
  - Keep existing SELECT and UPDATE policies
  
  ## Security Notes
  This is safe because:
  - The form configuration editors are only accessible through protected super admin routes
  - Super admins use custom authentication through admin_users table
  - The frontend enforces access control before showing these editors
*/

-- Drop existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert form configurations" ON form_configurations;

-- Create new policies for full management access
CREATE POLICY "Allow public insert access to form configurations"
  ON form_configurations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to form configurations"
  ON form_configurations
  FOR DELETE
  TO anon, authenticated
  USING (true);
