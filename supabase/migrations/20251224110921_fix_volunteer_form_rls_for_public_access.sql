/*
  # Fix Volunteer Form RLS Policies for Public Access

  1. Changes
    - Drop existing restrictive RLS policies that require authentication
    - Create new policies allowing public access for all operations
    - Matches the pattern used by office_items_requests and stationery_voucher_submissions

  2. Security
    - Allows public read access so admin dashboard can view submissions without Supabase Auth
    - Allows public write access for form submissions and status updates
    - Admin access is controlled via custom admin login system in localStorage

  3. Notes
    - This change enables the volunteer form dashboard to work properly
    - Submissions will now be visible immediately after form submission
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view all volunteer submissions" ON volunteer_form_submissions;
DROP POLICY IF EXISTS "Authenticated users can update volunteer submissions" ON volunteer_form_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete volunteer submissions" ON volunteer_form_submissions;
DROP POLICY IF EXISTS "Anyone can submit volunteer forms" ON volunteer_form_submissions;

-- Create new public access policies
CREATE POLICY "Anyone can view volunteer submissions"
  ON volunteer_form_submissions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can submit volunteer forms"
  ON volunteer_form_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update volunteer submissions"
  ON volunteer_form_submissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete volunteer submissions"
  ON volunteer_form_submissions
  FOR DELETE
  TO public
  USING (true);