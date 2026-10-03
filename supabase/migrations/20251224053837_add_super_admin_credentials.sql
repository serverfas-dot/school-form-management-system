/*
  # Add Super Admin Credentials

  ## Overview
  This migration adds a super admin user and role system to distinguish between regular admins and super admins.

  ## 1. Schema Changes
  - Add `role` column to admin_users table (admin or super_admin)
  - Add super admin credentials
  
  ## 2. Security
  - Super admin has full access to all features including Form Settings
  - Regular admin can only view form submissions
  
  ## 3. Super Admin Credentials
  - Username: supaadmin
  - Password: SuperAdmin@2024
  - Full Name: Super Administrator
*/

-- Add role column to admin_users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN role text DEFAULT 'admin';
  END IF;
END $$;

-- Insert super admin credentials
INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES (
  'supaadmin',
  crypt('SuperAdmin@2024', gen_salt('bf')),
  'Super Administrator',
  'super_admin'
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = crypt('SuperAdmin@2024', gen_salt('bf')),
  full_name = 'Super Administrator',
  role = 'super_admin';

-- Update existing admin users to have 'admin' role
UPDATE admin_users 
SET role = 'admin' 
WHERE role IS NULL OR role = '';
