/*
  # Add Monthly Backup Option

  ## Overview
  This migration adds monthly backup option to the backup system.

  ## 1. Changes
    - Update backup_type constraint to include 'monthly'
    - Update next_backup_date function to handle monthly backups
    - Insert monthly backup configuration

  ## 2. Notes
    - Monthly backups trigger 30 days after the last backup
*/

-- Drop existing constraint and add new one with monthly
ALTER TABLE backup_configurations 
  DROP CONSTRAINT IF EXISTS backup_configurations_backup_type_check;

ALTER TABLE backup_configurations
  ADD CONSTRAINT backup_configurations_backup_type_check 
  CHECK (backup_type IN ('manual', 'weekly', 'monthly', 'yearly'));

-- Update the function to handle monthly backups
CREATE OR REPLACE FUNCTION update_next_backup_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.schedule_enabled = true THEN
    IF NEW.backup_type = 'weekly' THEN
      NEW.next_backup_date := COALESCE(NEW.last_backup_date, now()) + INTERVAL '7 days';
    ELSIF NEW.backup_type = 'monthly' THEN
      NEW.next_backup_date := COALESCE(NEW.last_backup_date, now()) + INTERVAL '30 days';
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

-- Insert monthly backup configuration
INSERT INTO backup_configurations (backup_type, schedule_enabled)
VALUES ('monthly', false)
ON CONFLICT DO NOTHING;