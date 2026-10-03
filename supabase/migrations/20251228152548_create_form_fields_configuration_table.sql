/*
  # Create Form Fields Configuration Table

  1. New Tables
    - `form_fields`
      - `id` (uuid, primary key)
      - `form_key` (text) - Identifies which form this field belongs to
      - `field_key` (text) - Unique identifier for the field
      - `field_label` (text) - Display label for the field
      - `field_label_dhivehi` (text) - Dhivehi label
      - `field_type` (text) - Type of field (text, textarea, select, checkbox, etc.)
      - `field_options` (jsonb) - Options for select/checkbox fields
      - `is_required` (boolean) - Whether field is required
      - `display_order` (integer) - Order in which field appears
      - `is_active` (boolean) - Whether field is displayed
      - `placeholder` (text) - Placeholder text
      - `section` (text) - Section/group this field belongs to
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `form_fields` table
    - Add policy for public read access
    - Add policy for public write access (for super admin editing)

  3. Initial Data
    - Will be populated later with existing form fields
*/

CREATE TABLE IF NOT EXISTS form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key text NOT NULL,
  field_key text NOT NULL,
  field_label text NOT NULL,
  field_label_dhivehi text DEFAULT '',
  field_type text NOT NULL,
  field_options jsonb DEFAULT '[]',
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  placeholder text DEFAULT '',
  section text DEFAULT '',
  help_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(form_key, field_key)
);

-- Enable RLS
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can read form fields"
  ON form_fields
  FOR SELECT
  TO public
  USING (is_active = true);

-- Public write policy (for super admin)
CREATE POLICY "Anyone can manage form fields"
  ON form_fields
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_fields_form_key ON form_fields(form_key);
CREATE INDEX IF NOT EXISTS idx_form_fields_display_order ON form_fields(form_key, display_order);