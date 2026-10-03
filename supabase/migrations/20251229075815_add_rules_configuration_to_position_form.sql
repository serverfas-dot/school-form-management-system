/*
  # Add Rules Configuration to Position Form
  
  ## Overview
  Adds a rules_content jsonb column to form_configurations table to store the editable rules/criteria content for the position application form.
  
  ## Changes
  - Add `rules_content` column to form_configurations table
  - Insert default rules content for position_applications form
  
  ## Security
  - Uses existing RLS policies which allow super admin to edit
*/

-- Add rules_content column to form_configurations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_configurations' AND column_name = 'rules_content'
  ) THEN
    ALTER TABLE form_configurations ADD COLUMN rules_content jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update position_applications form with default rules content
UPDATE form_configurations
SET rules_content = '[
  {
    "title": "މަޤާމަށް ކުރިމަތިލުމަށް ދިމާވާންޖެހޭ ޝަރުޠުތައް:",
    "color": "amber",
    "items": [
      "• ކުރީގެ ދެ ސެމެސްޓަރުގެ ފަހު ނަތީޖާ ހޯދާފައިވާ ނަމަވެސް މަގުބޫލު ގްރޭޑެއް ލިބިފައިވުން 75 ޕަސެންޓް ނޫނީ އެއަށްވުރެ މަތިން.",
      "• އުމުރުން 85 އަހަރުގެ މައްޗަށް ހުރި ނުވަތަ އަހަރަކު ގުރޫޕަކަށް މެންބަރުވެ 2 އަހަރެއްހާ ދުވަހު ނަމުން ހުރިއްޔާ މަރުކަޒުގެ ނަން ފޮތުން ނަން ފޮހެލުން.",
      "• މަޤާމާ ގުޅުންހުރި ކުރިއެރުން ހާސިލުކޮށް ހުރިކަން."
    ]
  },
  {
    "title": "ނަތީޖާ އިއުލާނު ކުރުން:",
    "color": "blue",
    "items": [
      "• މަޤާމް - 40%",
      "• ޑިއުޓީ ޕާފޯމަންސް - 20%",
      "• މަދަދު - 15%",
      "• ޝައުގު - 10%",
      "• ޑިއުޓީ މުބާރާތާބެހޭ ޝުއޫރު - 30%",
      "• އިންޓަވިއު އަދި އަމަލީ ހުނަރު ބަލައި އިމްތިހާންކޮށް."
    ],
    "note": "މިފަދަ މަޤާމަކަށް ކުރިމަތިލާ ދަރިވަރުން ދެން ފޮނުވާނީ ބަޔާން ބަރަކާތް ލިބޭތޯ ބެލުމަށެވެ."
  },
  {
    "title": "ނޯޓު:",
    "color": "green",
    "items": [
      "• ކުރީގެ ދެ ސެމެސްޓަރުގެ ފަހު ނަތީޖާ ހޯދާފައިވާ ނަމަވެސް މަގުބޫލު ގްރޭޑެއް ލިބިފައިވުން 50 ޕަސެންޓް ނޫނީ އެއަށްވުރެ މަތިން.",
      "• އުމުރުން 85 އަހަރުގެ މައްޗަށް ހުރި ނުވަތަ އަހަރަކު ގުރޫޕަކަށް މެންބަރުވެ 2 އަހަރެއްހާ ދުވަހު ނަމުން ހުރިއްޔާ މަރުކަޒުގެ ނަން ފޮތުން ނަން ފޮހެލުން.",
      "• މަޤާމާ ގުޅުންހުރި ކުރިއެރުން ހާސިލުކޮށް ހުރިކަން."
    ]
  },
  {
    "title": "އިންޓަވިއުއަށް ހޯދާ މާކް ޖޫމު:",
    "color": "purple",
    "items": [
      "• މަޤާމް - 30%",
      "• ޑިއުޓީ ޕާފޯމަންސް - 30%",
      "• މަދަދު - 15%",
      "• ޝައުގު - 10%",
      "• ޑިއުޓީ މުބާރާތާބެހޭ ޝުއޫރު - 15%",
      "• އިންޓަވިއު އަދި އަމަލީ ހުނަރު ބަލައި އިމްތިހާންކޮށް."
    ]
  }
]'::jsonb
WHERE form_key = 'position_applications';
