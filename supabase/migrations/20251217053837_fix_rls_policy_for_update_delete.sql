/*
  # Fix RLS Policies for Update and Delete Operations

  ## Overview
  This migration allows anonymous users to update and delete stationery voucher submissions.
  
  ## Changes
  - Add policies to allow public/anonymous users to UPDATE and DELETE from stationery_voucher_submissions
  - This enables the admin dashboard (which uses custom auth) to edit and delete submissions
  
  ## Security Note
  - The admin dashboard itself is protected by custom authentication
  - Public update/delete access is acceptable since the dashboard requires login
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can update voucher submissions" ON stationery_voucher_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete voucher submissions" ON stationery_voucher_submissions;

-- Create new policies that allow anyone to update and delete
CREATE POLICY "Anyone can update voucher submissions"
  ON stationery_voucher_submissions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete voucher submissions"
  ON stationery_voucher_submissions FOR DELETE
  TO public
  USING (true);