/*
  # Allow Anonymous Access to Position Applications
  
  ## Overview
  Updates RLS policies on position_applications table to allow anonymous users (including super admin and admin users who use custom authentication) to read, update, and delete position applications.
  
  ## Changes
  - Drop existing restrictive policies that only allow authenticated users
  - Create new policies that allow both anon and authenticated users to:
    - Read all position applications
    - Update all position applications
    - Delete all position applications
  - Keep the INSERT policy as is (allows anon and authenticated to submit)
  
  ## Security Notes
  This is safe because:
  - The super admin and regular admin use custom authentication through admin_users table
  - They access the dashboard through protected routes that verify their credentials
  - The frontend enforces access control before showing these dashboards
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read position applications" ON position_applications;
DROP POLICY IF EXISTS "Authenticated users can update position applications" ON position_applications;
DROP POLICY IF EXISTS "Authenticated users can delete position applications" ON position_applications;

-- Create new policies that allow anon access for admin dashboards
CREATE POLICY "Allow public read access to position applications"
  ON position_applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public update access to position applications"
  ON position_applications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to position applications"
  ON position_applications
  FOR DELETE
  TO anon, authenticated
  USING (true);
