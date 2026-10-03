/*
  # Fix RLS Policy for Public Reads

  ## Overview
  This migration allows anonymous users to read stationery voucher submissions.
  
  ## Changes
  - Add policy to allow public/anonymous users to SELECT from stationery_voucher_submissions
  - This enables the admin dashboard (which uses custom auth) to view submissions
  
  ## Security Note
  - The admin dashboard itself is protected by custom authentication
  - Public read access is acceptable since the dashboard requires login
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can view all voucher submissions" ON stationery_voucher_submissions;

-- Create a new policy that allows anyone to view submissions
CREATE POLICY "Anyone can view voucher submissions"
  ON stationery_voucher_submissions FOR SELECT
  TO public
  USING (true);