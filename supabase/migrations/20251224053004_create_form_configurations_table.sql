/*
  # Create Form Configurations Table

  ## Overview
  This migration creates a table for storing editable form configurations including headings, subheadings, and other text content that admins can modify.

  ## 1. New Tables
  
  ### `form_configurations`
  - `id` (uuid, primary key) - Unique configuration identifier
  - `form_type` (text, unique) - Type of form (stationery, office-items, volunteer)
  - `title` (text) - Main form title
  - `subtitle` (text) - Form subtitle/description
  - `success_message` (text) - Message shown on successful submission
  - `button_text` (text) - Submit button text
  - `additional_config` (jsonb) - Additional form-specific configurations
  - `updated_at` (timestamptz) - Last update timestamp
  - `updated_by` (text) - Admin who last updated
  
  ## 2. Security
  - Enable RLS on form_configurations table
  - Anyone can read configurations (needed for form display)
  - Only authenticated users (admins) can update configurations
  
  ## 3. Initial Data
  - Seed with default configurations for all three forms
*/

-- Create form_configurations table
CREATE TABLE IF NOT EXISTS form_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text DEFAULT '',
  success_message text DEFAULT '',
  button_text text DEFAULT 'Submit',
  additional_config jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by text DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read form configurations"
  ON form_configurations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update form configurations"
  ON form_configurations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert form configurations"
  ON form_configurations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default configurations
INSERT INTO form_configurations (form_type, title, subtitle, success_message, button_text, additional_config)
VALUES 
  (
    'stationery',
    'Stationery Voucher Request Form',
    'Academic Year 2026',
    'Your stationery voucher request has been submitted successfully!',
    'Submit Request',
    '{
      "landing_title": "Stationery Voucher Request",
      "landing_description": "Submit your stationery voucher request for Academic Year 2026"
    }'::jsonb
  ),
  (
    'office-items',
    'Office Items Request Form',
    'Request items for your organization',
    'Your office items request has been submitted successfully!',
    'Submit Request',
    '{
      "landing_title": "Office Items Request",
      "landing_description": "Request office items for your organization or department"
    }'::jsonb
  ),
  (
    'volunteer',
    'ވޮލަންޓިއަރ ރަޖިސްޓްރޭޝަން ފޯމު',
    'އަންހެނުން ވޮލިންޓިއަރއަކަށް ވުމަށް އެދޭ ފޯމް',
    'ތިޔަބޭފުޅުންގެ ފޯމު ކާމިޔާބުކަމާއެކު ހުށަހަޅައިފި',
    'ހުށަހެޅުން',
    '{
      "landing_title": "Volunteer Registration",
      "landing_title_dv": "ވޮލަންޓިއަރ ރަޖިސްޓްރޭޝަން ފޯމު",
      "landing_description": "Register to become a school volunteer"
    }'::jsonb
  )
ON CONFLICT (form_type) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_form_type ON form_configurations(form_type);
