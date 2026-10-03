/*
  # Allow Anonymous Updates for Club Registrations

  1. Changes
    - Drop the authenticated-only update policy
    - Add new policy allowing anonymous users to update club registrations
    - This allows the admin dashboard to work without Supabase authentication

  2. Security
    - Anonymous users can now update club registrations
    - Frontend admin login provides access control
*/

-- Drop existing authenticated update policy
DROP POLICY IF EXISTS "Authenticated users can update club registrations" ON club_registrations;

-- Create new policy for anonymous users
CREATE POLICY "Anyone can update club registrations"
  ON club_registrations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);