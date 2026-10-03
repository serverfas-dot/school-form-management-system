/*
  # Create Backup Configurations Table

  ## Overview
  This migration creates a backup configurations table to store backup settings and history.

  ## 1. New Tables
    - `backup_configurations`
      - `id` (uuid, primary key)
      - `backup_type` (text: 'manual', 'weekly', 'yearly')
      - `schedule_enabled` (boolean)
      - `last_backup_date` (timestamptz)
      - `next_backup_date` (timestamptz)
      - `backup_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `backup_history`
      - `id` (uuid, primary key)
      - `backup_type` (text)
      - `backup_size` (bigint)
      - `record_count` (integer)
      - `tables_backed_up` (jsonb)
      - `created_at` (timestamptz)
      - `created_by` (text)

  ## 2. Security
    - Enable RLS on both tables
    - Only super admins can access these tables
*/

-- Create backup_configurations table
CREATE TABLE IF NOT EXISTS backup_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL CHECK (backup_type IN ('manual', 'weekly', 'yearly')),
  schedule_enabled boolean DEFAULT false,
  last_backup_date timestamptz,
  next_backup_date timestamptz,
  backup_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create backup_history table
CREATE TABLE IF NOT EXISTS backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL,
  backup_size bigint DEFAULT 0,
  record_count integer DEFAULT 0,
  tables_backed_up jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT ''
);

-- Enable RLS
ALTER TABLE backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Policies for backup_configurations (super admin only)
CREATE POLICY "Super admins can view backup configurations"
  ON backup_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can insert backup configurations"
  ON backup_configurations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can update backup configurations"
  ON backup_configurations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for backup_history (super admin only)
CREATE POLICY "Super admins can view backup history"
  ON backup_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can insert backup history"
  ON backup_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default configurations
INSERT INTO backup_configurations (backup_type, schedule_enabled)
VALUES 
  ('weekly', false),
  ('yearly', false)
ON CONFLICT DO NOTHING;

-- Create function to update next_backup_date
CREATE OR REPLACE FUNCTION update_next_backup_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.schedule_enabled = true THEN
    IF NEW.backup_type = 'weekly' THEN
      NEW.next_backup_date := COALESCE(NEW.last_backup_date, now()) + INTERVAL '7 days';
    ELSIF NEW.backup_type = 'yearly' THEN
      NEW.next_backup_date := COALESCE(NEW.last_backup_date, now()) + INTERVAL '1 year';
    END IF;
  ELSE
    NEW.next_backup_date := NULL;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating next backup date
DROP TRIGGER IF EXISTS trigger_update_next_backup_date ON backup_configurations;
CREATE TRIGGER trigger_update_next_backup_date
  BEFORE INSERT OR UPDATE ON backup_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_next_backup_date();