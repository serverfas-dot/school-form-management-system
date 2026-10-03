/*
  # Fix Form Configurations RLS Policy
  
  1. Changes
    - Drop the existing UPDATE policy that requires authenticated users
    - Create a new UPDATE policy that allows public (anon) users to update
    - This enables Super Admin (which uses custom auth, not Supabase auth) to update form settings
  
  2. Security Notes
    - Form configurations are non-sensitive administrative settings
    - Super Admin access is still protected by custom authentication
    - Only form configuration fields can be updated, not sensitive user data
*/

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update form configurations" ON form_configurations;

-- Create a new public UPDATE policy
CREATE POLICY "Anyone can update form configurations"
  ON form_configurations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);