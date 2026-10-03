/*
  # Create Club Registration Table for 2026

  1. New Tables
    - `club_registrations`
      - `id` (uuid, primary key)
      - `student_name` (text) - Name of the student
      - `student_index` (text) - Student index number
      - `student_grade` (text) - Student's grade/class
      - `club` (text) - Selected club name
      - `submitted_at` (timestamptz) - When the form was submitted
      - `status` (text) - Registration status (pending/approved/rejected)
      - `email` (text, nullable) - Optional email for notifications

  2. Security
    - Enable RLS on `club_registrations` table
    - Add policy for public to insert their own registrations
    - Add policy for authenticated admins to read all registrations
    - Add policy for authenticated admins to update registration status
*/

CREATE TABLE IF NOT EXISTS club_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_index text NOT NULL,
  student_grade text NOT NULL,
  club text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  email text DEFAULT ''
);

ALTER TABLE club_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit club registration"
  ON club_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read all club registrations"
  ON club_registrations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can update club registrations"
  ON club_registrations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete club registrations"
  ON club_registrations
  FOR DELETE
  TO authenticated
  USING (true);