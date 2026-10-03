/*
  # Update Position Applications Table for Comprehensive Form
  
  Updates the position_applications table to support the full detailed form with:
  - Student information
  - Multiple position types (Captain, Games Captain, Prefects, Association, Clubs, Sports Club, Houses)
  - Academic records for two semesters
  - Additional activities participation
  
  1. Changes
    - Drop and recreate position_applications table with new comprehensive structure
    - Store club and house selections as JSONB for flexibility
    - Store academic records as JSONB
    - Store activities as JSONB
    
  2. Security
    - Maintain RLS policies for public insert and authenticated admin access
*/

DROP TABLE IF EXISTS position_applications;

CREATE TABLE position_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text,
  student_name text NOT NULL,
  student_index text NOT NULL,
  student_class text NOT NULL,
  previous_positions text,
  
  -- Position selections
  captain_position text,
  games_captain_position text,
  prefect_position text,
  association_position text,
  
  -- Clubs (JSONB array of objects with club name and designation)
  clubs_selections jsonb DEFAULT '[]',
  
  -- Sports Club
  sports_club_position text,
  
  -- Houses (JSONB array of objects with house name and designation)
  houses_selections jsonb DEFAULT '[]',
  
  -- Academic records
  first_semester_grades jsonb DEFAULT '{}',
  second_semester_grades jsonb DEFAULT '{}',
  
  -- Additional activities
  dhivehi_week text,
  english_week text,
  islam_week text,
  sports_competitions text,
  other_activities text,
  
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE position_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit position applications"
  ON position_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read position applications"
  ON position_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update position applications"
  ON position_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete position applications"
  ON position_applications
  FOR DELETE
  TO authenticated
  USING (true);