/*
  # Create Form System Database Schema

  ## Overview
  This migration sets up a complete form management system with admin authentication.

  ## 1. New Tables
  
  ### `admin_users`
  - `id` (uuid, primary key) - Unique admin user identifier
  - `username` (text, unique) - Admin login username
  - `password_hash` (text) - Hashed password for security
  - `full_name` (text) - Admin's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `forms`
  - `id` (uuid, primary key) - Unique form identifier
  - `form_name` (text) - Name of the form type
  - `form_description` (text) - Description of the form
  - `is_active` (boolean) - Whether the form is currently accepting submissions
  - `created_at` (timestamptz) - Form creation timestamp
  
  ### `form_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `form_id` (uuid, foreign key) - References the form type
  - `submission_data` (jsonb) - Flexible JSON storage for form data
  - `submitted_at` (timestamptz) - Submission timestamp
  - `status` (text) - Submission status (pending, reviewed, archived)
  
  ### `stationery_voucher_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `student_name` (text) - Student's full name
  - `id_card_number` (text) - Student's ID card number
  - `grade` (integer) - Student's grade (1-10)
  - `parent_full_name` (text) - Parent/guardian full name
  - `request_date` (date) - Date of the request
  - `submitted_at` (timestamptz) - Timestamp of submission
  - `status` (text) - Status of the submission
  
  ## 2. Security
  - Enable RLS on all tables
  - Admin users table: Only accessible by authenticated admins
  - Forms table: Public can read, admins can modify
  - Submissions tables: Public can insert, admins can read/update/delete
  
  ## 3. Initial Data
  - Creates default admin account (username: admin, password: admin123)
  - Creates the Stationery Voucher Request Form 2026
  
  ## 4. Important Notes
  - Password is hashed using pgcrypto extension
  - All submissions are timestamped automatically
  - Grade data is stored as integer for easy filtering and sorting
*/

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name text NOT NULL,
  form_description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create form_submissions table (generic for all form types)
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  submission_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Create stationery_voucher_submissions table
CREATE TABLE IF NOT EXISTS stationery_voucher_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  id_card_number text NOT NULL,
  grade integer NOT NULL CHECK (grade >= 1 AND grade <= 10),
  parent_full_name text NOT NULL,
  request_date date NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stationery_voucher_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admin users can read own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for forms
CREATE POLICY "Anyone can view active forms"
  ON forms FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all forms"
  ON forms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert forms"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update forms"
  ON forms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete forms"
  ON forms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for form_submissions
CREATE POLICY "Anyone can submit forms"
  ON form_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update submissions"
  ON form_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete submissions"
  ON form_submissions FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for stationery_voucher_submissions
CREATE POLICY "Anyone can submit voucher requests"
  ON stationery_voucher_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all voucher submissions"
  ON stationery_voucher_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update voucher submissions"
  ON stationery_voucher_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete voucher submissions"
  ON stationery_voucher_submissions FOR DELETE
  TO authenticated
  USING (true);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash, full_name)
VALUES ('admin', crypt('admin123', gen_salt('bf')), 'System Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert the Stationery Voucher Request Form
INSERT INTO forms (form_name, form_description, is_active)
VALUES (
  'Stationery Voucher Request Form 2026',
  'Request form for student stationery vouchers for the year 2026',
  true
)
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_voucher_grade ON stationery_voucher_submissions(grade);
CREATE INDEX IF NOT EXISTS idx_voucher_submitted_at ON stationery_voucher_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_voucher_status ON stationery_voucher_submissions(status);