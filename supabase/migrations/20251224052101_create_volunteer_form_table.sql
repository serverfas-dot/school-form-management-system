/*
  # Create Volunteer Form Table

  ## Overview
  This migration creates a table for storing volunteer application form submissions in Dhivehi language.

  ## 1. New Tables
  
  ### `volunteer_form_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `volunteer_activities` (jsonb) - Selected volunteer activities as checkbox array
  - `name` (text) - Applicant's full name (ނަން)
  - `child_student` (text) - Child/Student information (ދަރީ)
  - `blood_group` (text) - Blood group (ރައްދު ގުރުފް)
  - `mobile_number` (text) - Primary mobile number (މޯބައިލް ނަމްބަރެއް)
  - `additional_mobile` (text) - Additional mobile number (އިތުރު މޯބައިލް ނަމްބަރެއް)
  - `arrangement` (text) - Arrangement/Position (އިންތިޒާން)
  - `office_number` (text) - Office number (އޯފީސް ނަމްބަރެއް)
  - `submitted_at` (timestamptz) - Submission timestamp
  - `status` (text) - Status of the submission (pending, reviewed, archived)
  
  ## 2. Security
  - Enable RLS on volunteer_form_submissions table
  - Anyone can submit (insert)
  - Only authenticated users (admins) can view, update, and delete
  
  ## 3. Important Notes
  - All text fields support Dhivehi script (UTF-8)
  - Volunteer activities stored as JSONB for flexibility
  - Default status is 'pending'
  - Includes indexes for better query performance
*/

-- Create volunteer_form_submissions table
CREATE TABLE IF NOT EXISTS volunteer_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_activities jsonb NOT NULL DEFAULT '[]',
  name text NOT NULL,
  child_student text DEFAULT '',
  blood_group text DEFAULT '',
  mobile_number text NOT NULL,
  additional_mobile text DEFAULT '',
  arrangement text DEFAULT '',
  office_number text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE volunteer_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for volunteer_form_submissions
CREATE POLICY "Anyone can submit volunteer forms"
  ON volunteer_form_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all volunteer submissions"
  ON volunteer_form_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update volunteer submissions"
  ON volunteer_form_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete volunteer submissions"
  ON volunteer_form_submissions FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_volunteer_submitted_at ON volunteer_form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_volunteer_status ON volunteer_form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_name ON volunteer_form_submissions(name);
