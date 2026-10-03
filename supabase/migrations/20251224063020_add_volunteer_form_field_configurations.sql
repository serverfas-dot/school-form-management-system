/*
  # Add Volunteer Form Field Configurations
  
  1. Changes
    - Update the volunteer form configuration to include all editable fields
    - Section headings (activities section, info section, note section)
    - Activity options (checkboxes for volunteer activities)
    - Form field labels (all input labels)
    - Home page card details (the bullet points shown on landing page)
  
  2. New Configuration Fields
    - section_headings: All section titles
    - activity_options: Array of checkbox options
    - field_labels: All form field labels
    - card_details: Bullet points for home page card
*/

UPDATE form_configurations
SET additional_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        additional_config,
        '{section_headings}',
        '{"activities": "ވަޒީފާ / ބޯޑުތައް / ގްރޫޕްތައް އިޚްތިޔާރުކުރައްވާ", "info": "މައުލޫމާތު", "note": "ނޯޓް", "other_activity": "އެހެނިހެން:"}'::jsonb
      ),
      '{activity_options}',
      '[
        "ތިލަވުގެ އުފެއްދުންތެރިކަމާބެހޭ ހުނަރު ވެރި ކުދީންގެ ގްރޫޕް",
        "ބައިސްކޯޕް، ސާންސް ސެންޓާރު، ލައިބްރަރީ ބޯޑު",
        "ބައްތިކުޅި މުބާރާތު ކޯޗިންގ ބޯޑު",
        "ކުދިން ފޯރިސް ކޭސްކުރުމަށް މެނޭޖުކުރުން ބޯޑު",
        "ބައްތިކުޅި މުބާރާތުގައި މަސައްކަތް ކުރުން ބޯޑު",
        "ވޮލަންޓިއާ ސްކޮލަރޝިޕް ބޯޑު",
        "ބަސްލަން އެސިސްޓް (6 ވަނަ)",
        "ބަސްލަން، ވޮލަންޓިއާރުގެ ކޯޗިންގ، މަސައްކަތް، ކުދިން މަޑުކޮށް ބޯޑު"
      ]'::jsonb
    ),
    '{field_labels}',
    '{
      "name": "ނަން",
      "child_student": "ދަރީ",
      "blood_group": "ރަތް ގުރޫޕް",
      "mobile_number": "މޯބައިލް ނަމްބަރެއް",
      "additional_mobile": "އިތުރު މޯބައިލް ނަމްބަރެއް",
      "arrangement": "އިންތިޒާމް",
      "office_number": "އޮފީސް ނަމްބަރެއް",
      "other_activity_placeholder": "އެހެން މަސައްކަތެއް ލިޔުއްވާ",
      "blood_group_placeholder": "A+, B+, O+, AB+"
    }'::jsonb
  ),
  '{card_details}',
  '["• Volunteer Activities", "• Personal Information", "• Contact Details", "• Emergency Contact"]'::jsonb
),
updated_at = now()
WHERE form_type = 'volunteer';