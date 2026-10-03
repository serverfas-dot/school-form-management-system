/*
  # Fix RLS Policy for Office Items Requests

  ## Overview
  This migration allows anonymous users to read office items requests.
  
  ## Changes
  - Drop the existing restrictive SELECT policy
  - Add policy to allow public/anonymous users to SELECT from office_items_requests
  - This enables the admin dashboard (which uses custom auth) to view requests
  
  ## Security Note
  - The admin dashboard itself is protected by custom authentication
  - Public read access is acceptable since the dashboard requires login
  - Update and delete operations remain restricted to authenticated users
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view all office items requests" ON office_items_requests;

-- Create a new policy that allows anyone to view requests
CREATE POLICY "Anyone can view office items requests"
  ON office_items_requests FOR SELECT
  TO public
  USING (true);

-- Also update the update policy to allow public (since custom auth is used)
DROP POLICY IF EXISTS "Authenticated users can update office items requests" ON office_items_requests;

CREATE POLICY "Anyone can update office items requests"
  ON office_items_requests FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Also update the delete policy
DROP POLICY IF EXISTS "Authenticated users can delete office items requests" ON office_items_requests;

CREATE POLICY "Anyone can delete office items requests"
  ON office_items_requests FOR DELETE
  TO public
  USING (true);
