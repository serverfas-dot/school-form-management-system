/*
  # Populate Initial Form Fields

  1. Purpose
    - Populate form_fields table with existing fields from all forms
    - Provides initial configuration for Form Field Editor

  2. Forms Populated
    - Volunteer Service Request Form (volunteer)
    - Club Registration Form (club-registration)
    - Leadership Position Application (position-application)
    - Office Items Request Form (office-items)
    - Stationery Voucher Request Form (stationery)

  3. Field Configuration
    - Each field includes labels in English and Dhivehi
    - Field types, options, and validation rules
    - Display order and active status
*/

-- Volunteer Form Fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, section, placeholder) VALUES
('volunteer', 'volunteerActivities', 'Volunteer Activities', 'ވޮލަންޓިއާ މަސައްކަތްތައް', 'checkbox', '["ތިލަވުގެ އުފެއްދުންތެރިކަމާބެހޭ ހުނަރު ވެރި ކުދީންގެ ގްރޫޕް", "ބައިސްކޯޕް، ސާންސް ސެންޓާރު، ލައިބްރަރީ ބޯޑު", "ބައްތިކުޅި މުބާރާތު ކޯޗިންގ ބޯޑު", "ކުދިން ފޯރިސް ކޭސްކުރުމަށް މެނޭޖުކުރުން ބޯޑު", "ބައްތިކުޅި މުބާރާތުގައި މަސައްކަތް ކުރުން ބޯޑު", "ވޮލަންޓިއާ ސްކޮލަރޝިޕް ބޯޑު", "ބަސްލަން އެސިސްޓް (6 ވަނަ)", "ބަސްލަން، ވޮލަންޓިއާރުގެ ކޯޗިންގ، މަސައްކަތް، ކުދިން މަޑުކޮށް ބޯޑު"]', true, 0, true, 'Section 1', ''),
('volunteer', 'otherActivity', 'Other Activity', 'އެހެން މަސައްކަތެއް', 'textarea', '[]', false, 1, true, 'Section 1', 'އެހެން މަސައްކަތެއް ލިޔުއްވާ'),
('volunteer', 'name', 'Full Name', 'ފުރިހަމަ ނަން', 'text', '[]', true, 2, true, 'Section 2', 'ފުރިހަމަ ނަން'),
('volunteer', 'designation', 'Designation', 'މަގާމު', 'text', '[]', false, 3, true, 'Section 2', 'މަގާމު'),
('volunteer', 'address', 'Address', 'އެޑްރެސް', 'text', '[]', false, 4, true, 'Section 2', 'އެޑްރެސް'),
('volunteer', 'idNumber', 'ID Number', 'އައިޑީ ނަންބަރު', 'text', '[]', false, 5, true, 'Section 2', 'އައިޑީ ނަންބަރު'),
('volunteer', 'email', 'Email', 'އީމެއިލް', 'email', '[]', false, 6, true, 'Section 2', 'އީމެއިލް'),
('volunteer', 'phoneNumber', 'Phone Number', 'ފޯނު ނަންބަރު', 'text', '[]', true, 7, true, 'Section 2', 'ފޯނު ނަންބަރު');

-- Club Registration Form Fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, placeholder) VALUES
('club-registration', 'studentName', 'Student Name', 'ކުއްޖާގެ ނަން', 'text', '[]', true, 0, true, 'Enter student name'),
('club-registration', 'studentIndex', 'Student Index Number', 'އިންޑެކްސް ނަންބަރު', 'text', '[]', true, 1, true, 'Enter index number'),
('club-registration', 'studentGrade', 'Grade', 'ގްރޭޑް', 'select', '["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"]', true, 2, true, 'Select grade'),
('club-registration', 'club', 'Club', 'ކްލަބް', 'select', '["Islam Club", "Dhivehi Club", "E.S Club", "English Club", "Maths Club"]', true, 3, true, 'Select club'),
('club-registration', 'email', 'Email (Optional)', 'އީމެއިލް', 'email', '[]', false, 4, true, 'Enter email (optional)');

-- Position Application Form Fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, placeholder) VALUES
('position-application', 'fullName', 'Full Name', 'ފުރިހަމަ ނަން', 'text', '[]', true, 0, true, 'Enter your full name'),
('position-application', 'grade', 'Grade', 'ގްރޭޑް', 'text', '[]', true, 1, true, 'Enter your grade'),
('position-application', 'indexNumber', 'Index Number', 'އިންޑެކްސް ނަންބަރު', 'text', '[]', true, 2, true, 'Enter your index number'),
('position-application', 'category', 'Category', 'ކެޓަގަރީ', 'select', '["Club", "House"]', true, 3, true, 'Select category'),
('position-application', 'specificSelection', 'Club/House', 'ކްލަބް/ހައުސް', 'select', '[]', true, 4, true, 'Select club or house'),
('position-application', 'position', 'Position', 'މަގާމު', 'select', '[]', true, 5, true, 'Select position'),
('position-application', 'reason', 'Why do you want this position?', 'މި މަގާމަށް އެދޭ ސަބަބު', 'textarea', '[]', true, 6, true, 'Explain your reason'),
('position-application', 'experience', 'Relevant Experience', 'ތަޖުރިބާ', 'textarea', '[]', false, 7, true, 'Describe your experience'),
('position-application', 'email', 'Email', 'އީމެއިލް', 'email', '[]', false, 8, true, 'Enter your email');

-- Office Items Request Form Fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, placeholder) VALUES
('office-items', 'requesterName', 'Requester Name', 'ނަން', 'text', '[]', true, 0, true, 'Enter your name'),
('office-items', 'department', 'Department', 'ޑިޕާޓްމަންޓް', 'text', '[]', true, 1, true, 'Enter your department'),
('office-items', 'itemName', 'Item Name', 'އައިޓަމް', 'text', '[]', true, 2, true, 'Enter item name'),
('office-items', 'quantity', 'Quantity', 'އަދަދު', 'number', '[]', true, 3, true, 'Enter quantity'),
('office-items', 'purpose', 'Purpose', 'ބޭނުން', 'textarea', '[]', true, 4, true, 'Explain the purpose'),
('office-items', 'urgency', 'Urgency', 'އަވަސް މިންވަރު', 'select', '["Low", "Medium", "High", "Urgent"]', true, 5, true, 'Select urgency level'),
('office-items', 'email', 'Email', 'އީމެއިލް', 'email', '[]', false, 6, true, 'Enter your email');

-- Stationery Voucher Request Form Fields
INSERT INTO form_fields (form_key, field_key, field_label, field_label_dhivehi, field_type, field_options, is_required, display_order, is_active, placeholder) VALUES
('stationery', 'requesterName', 'Requester Name', 'ނަން', 'text', '[]', true, 0, true, 'Enter your name'),
('stationery', 'department', 'Department/Class', 'ޑިޕާޓްމަންޓް/ކްލާސް', 'text', '[]', true, 1, true, 'Enter your department or class'),
('stationery', 'itemsRequested', 'Items Requested', 'ބޭނުންވާ ތަކެތި', 'textarea', '[]', true, 2, true, 'List all items needed'),
('stationery', 'quantity', 'Total Quantity', 'އަދަދު', 'number', '[]', true, 3, true, 'Total number of items'),
('stationery', 'purpose', 'Purpose', 'ބޭނުން', 'textarea', '[]', true, 4, true, 'Purpose for stationery'),
('stationery', 'dateNeeded', 'Date Needed', 'ބޭނުންވާ ތާރީޚް', 'date', '[]', false, 5, true, ''),
('stationery', 'email', 'Email', 'އީމެއިލް', 'email', '[]', false, 6, true, 'Enter your email');
