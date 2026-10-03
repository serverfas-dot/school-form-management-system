/*
  # Create Position Application Form Grid Configurations

  1. New Tables
    - `position_form_grids`
      - `id` (uuid, primary key)
      - `form_key` (text) - 'position_applications'
      - `grid_type` (text) - 'club' or 'house'
      - `rows` (jsonb) - Array of row labels
      - `columns` (jsonb) - Array of column labels
      - `heading` (text) - Main heading for the grid
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `position_form_grids` table
    - Add policy for public read access
    - Add policy for public write access

  3. Initial Data
    - Insert default club grid configuration
    - Insert default house grid configuration
*/

-- Create position_form_grids table
CREATE TABLE IF NOT EXISTS position_form_grids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key text NOT NULL DEFAULT 'position_applications',
  grid_type text NOT NULL,
  rows jsonb NOT NULL DEFAULT '[]',
  columns jsonb NOT NULL DEFAULT '[]',
  heading text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE position_form_grids ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can read position form grids"
  ON position_form_grids
  FOR SELECT
  TO public
  USING (true);

-- Public write policy
CREATE POLICY "Anyone can manage position form grids"
  ON position_form_grids
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default club grid configuration
INSERT INTO position_form_grids (grid_type, heading, rows, columns)
VALUES (
  'club',
  'ކުލަބުތަކަށް',
  '["ޖެނެރަލް", "އެސިސްޓެންޓް ޖެނެރަލް", "އެޑިއުކޭޝަން ސެކްރެޓްރީ", "މަންދޫބު"]'::jsonb,
  '["ޖެނެރަލް (ބްރީޒް)", "ކުޅިވަރު (ރޭމަރ)", "މަރުކަޒު (ބަޔޯލިނޯ)", "ރޮބޮޓިކްސް (އިބްރޫ)", "މާހިރު އޮފީސް (އިސްޕޯއާފްސް)"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert default house grid configuration
INSERT INTO position_form_grids (grid_type, heading, rows, columns)
VALUES (
  'house',
  'ހައުސްތަކަށް',
  '["ޖެނެރަލް", "އެސިސްޓެންޓް ޖެނެރަލް", "އެޑިއުކޭޝަން ސެކްރެޓްރީ", "މަންދޫބު"]'::jsonb,
  '["ކުލަބް", "ހައިބަރ", "ރޭމަރ"]'::jsonb
)
ON CONFLICT DO NOTHING;