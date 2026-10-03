/*
  # Fix Backup Configurations Access

  ## Overview
  This migration updates RLS policies to allow anonymous access to backup configurations and history tables.

  ## 1. Changes
    - Allow anon users to read backup configurations
    - Allow anon users to insert/update backup configurations
    - Allow anon users to read/insert backup history

  ## 2. Notes
    - Access control is handled at the application level through Super Admin authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can view backup configurations" ON backup_configurations;
DROP POLICY IF EXISTS "Super admins can insert backup configurations" ON backup_configurations;
DROP POLICY IF EXISTS "Super admins can update backup configurations" ON backup_configurations;
DROP POLICY IF EXISTS "Super admins can view backup history" ON backup_history;
DROP POLICY IF EXISTS "Super admins can insert backup history" ON backup_history;

-- Create new policies for backup_configurations (allow anon access)
CREATE POLICY "Allow anon to view backup configurations"
  ON backup_configurations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert backup configurations"
  ON backup_configurations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update backup configurations"
  ON backup_configurations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create new policies for backup_history (allow anon access)
CREATE POLICY "Allow anon to view backup history"
  ON backup_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert backup history"
  ON backup_history FOR INSERT
  TO anon
  WITH CHECK (true);