/*
  # Enable Realtime for Form Tables
  
  ## Overview
  Enables realtime replication for form_configurations and position_form_grids tables so that changes made in the Super Admin dashboard are instantly reflected in the public forms without requiring a page refresh.
  
  ## Changes
  - Enable realtime for form_configurations table
  - Enable realtime for position_form_grids table
  
  ## Security
  - Realtime only broadcasts changes, RLS policies still control who can read/write
*/

-- Enable realtime for form_configurations
ALTER PUBLICATION supabase_realtime ADD TABLE form_configurations;

-- Enable realtime for position_form_grids
ALTER PUBLICATION supabase_realtime ADD TABLE position_form_grids;
